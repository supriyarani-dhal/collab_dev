import React, { useEffect, useRef, useState } from "react";
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from "@/utils/Socket";
import { ACTIONS } from "@/utils/Actions";
import {
  useNavigate,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";

import axios from "axios";
import logo from "@/assets/logo.png";

import {
  Box,
  Button,
  Flex,
  Image,
  Select,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { toaster } from "./ui/toaster";

const LANGUAGES = [
  "python3",
  "java",
  "cpp",
  "nodejs",
  "c",
  "ruby",
  "go",
  "scala",
  "bash",
  "sql",
  "pascal",
  "csharp",
  "php",
  "swift",
  "rust",
  "r",
];

const EditorPage = () => {
  const [clients, setClients] = useState([]);
  const [output, setOutput] = useState("");
  const [isCompileWindowOpen, setIsCompileWindowOpen] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python3");
  const codeRef = useRef(null);

  const Location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const socketRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      const handleErrors = (err) => {
        console.log("Error", err);
        toaster.create({
          description: "Socket connection failed, Try again later",
          type: "error",
        });
        navigate("/");
      };

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: Location.state?.username,
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== Location.state?.username) {
            toaster.create({
              description: `${username} joined the room.`,
              type: "success",
            });
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toaster.create({
          description: `${username} left the room`,
          type: "success",
        });
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();

    return () => {
      socketRef.current && socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, []);

  if (!Location.state) {
    return <Navigate to="/" />;
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toaster.create({
        description: "Room ID copied",
        type: "success",
      });
    } catch (error) {
      console.log(error);
      toaster.create({
        description: "Unable to copy Room ID",
        type: "error",
      });
    }
  };

  const leaveRoom = () => {
    navigate("/");
  };

  const runCode = async () => {
    setIsCompiling(true);
    try {
      const response = await axios.post("http://localhost:5000/compile", {
        code: codeRef.current,
        language: selectedLanguage,
      });
      console.log("Backend response:", response.data);
      setOutput(response.data.output || JSON.stringify(response.data));
    } catch (error) {
      console.error(error);
      setOutput(error.response?.data?.error || "An error occurred");
    } finally {
      setIsCompiling(false);
    }
  };

  const toggleCompileWindow = () => {
    setIsCompileWindowOpen(!isCompileWindowOpen);
  };

  return (
    <Flex direction="column" minH="100vh" bg="gray.900">
      <Flex flex="1">
        {/* Sidebar */}
        <Flex
          direction="column"
          w={{ base: "100%", md: "250px" }}
          bg="gray.800"
          p={4}
          overflowY="auto"
        >
          <Image src={logo} alt="Logo" mx="auto" mt="-10" maxW="150px" />
          <Box borderWidth="1px" borderColor="gray.700" my={4} />

          <Text mb={2} color="gray.400">
            Members
          </Text>
          <VStack align="stretch" spacing={2} flex="1">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </VStack>

          <Box borderTop="1px" borderColor="gray.700" my={4} />

          <VStack spacing={2} mt="auto">
            <Button colorScheme="teal" size="sm" w="full" onClick={copyRoomId}>
              Copy Room ID
            </Button>
            <Button colorScheme="red" size="sm" w="full" onClick={leaveRoom}>
              Leave Room
            </Button>
          </VStack>
        </Flex>

        {/* Editor Area */}
        <Flex flex="1" direction="column" bg="gray.700">
          {/* Language Selector */}
          <Flex justify="flex-end" bg="gray.800" p={2}>
            <Select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              maxW="200px"
              bg="gray.900"
              color="white"
              borderColor="gray.600"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </Select>
          </Flex>

          {/* Editor */}
          <Box flex="1" overflowY="auto" p={4}>
            <Editor
              socketRef={socketRef}
              roomId={roomId}
              onCodeChange={(code) => {
                codeRef.current = code;
              }}
            />
          </Box>
        </Flex>
      </Flex>

      {/* Compiler Toggle Button */}
      <Button
        position="fixed"
        bottom="4"
        right="4"
        colorScheme="blue"
        onClick={toggleCompileWindow}
        zIndex="1050"
      >
        {isCompileWindowOpen ? "Close Compiler" : "Open Compiler"}
      </Button>

      {/* Compiler Section */}
      <Box
        position="fixed"
        bottom="0"
        left="0"
        right="0"
        height={isCompileWindowOpen ? "30vh" : "0"}
        overflowY="auto"
        bg="gray.800"
        transition="height 0.3s ease"
        p={isCompileWindowOpen ? 4 : 0}
        zIndex="1040"
      >
        {isCompileWindowOpen && (
          <Flex direction="column" height="full">
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontSize="lg" fontWeight="bold" color="white">
                Compiler Output ({selectedLanguage})
              </Text>
              <HStack>
                <Button
                  colorScheme="green"
                  size="sm"
                  onClick={runCode}
                  isLoading={isCompiling}
                >
                  {isCompiling ? "Compiling..." : "Run Code"}
                </Button>
                <Button
                  colorScheme="gray"
                  size="sm"
                  onClick={toggleCompileWindow}
                >
                  Close
                </Button>
              </HStack>
            </Flex>
            <Box bg="gray.900" flex="1" rounded="md" p={4} overflowY="auto">
              <Text whiteSpace="pre-wrap" color="gray.300">
                {output || "Output will appear here after compilation."}
              </Text>
            </Box>
          </Flex>
        )}
      </Box>
    </Flex>
  );
};

export default EditorPage;
