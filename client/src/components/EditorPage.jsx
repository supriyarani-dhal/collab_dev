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
import { Download } from "lucide-react";
import axios from "axios";
import logo from "@/assets/logo.png";

import {
  Box,
  Button,
  Flex,
  Image,
  Text,
  VStack,
  HStack,
  Portal,
  CloseButton,
  Dialog,
  Input,
} from "@chakra-ui/react";
import { toaster } from "./ui/toaster";
import { getFileExtension } from "@/constants/fileExtension";
import { LANGUAGES } from "@/constants/languages";

const EditorPage = () => {
  const [clients, setClients] = useState([]);
  const [output, setOutput] = useState("");
  const [isCompileWindowOpen, setIsCompileWindowOpen] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const Location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const socketRef = useRef(null);

  const codeRef = useRef(null);

  const cancelRef = useRef();
  const [fileNameInput, setFileNameInput] = useState("");

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
          console.log(clients);
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
      const socket = socketRef.current;
      if (socket) {
        socket.off(ACTIONS.JOINED);
        socket.off(ACTIONS.DISCONNECTED);
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    console.log(selectedLanguage);
    selectedLanguage === "javascript" && setSelectedLanguage("javascript");
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
      const response = await axios.post(
        "https://coding-capsule.onrender.com/compile",
        {
          code: codeRef.current,
          language: selectedLanguage,
        }
      );
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

  const handleSaveToLocal = (fileName) => {
    const fileExtension = getFileExtension(selectedLanguage);

    const blob = new Blob([codeRef.current], { type: "text/plain" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName.endsWith(fileExtension)
      ? fileName
      : `${fileName}${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <Image src={logo} alt="Logo" mx="auto" mb="5" maxW="150px" />

          <Text mb={2} color="white" fontSize="lg" fontWeight="bold">
            Members
          </Text>
          <VStack align="stretch" spacing={2} flex="1">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </VStack>

          <Box borderTop="1px" borderColor="gray.700" my={4} />

          <VStack spacing={2} mt="auto">
            <Button colorPalette="teal" size="sm" w="full" onClick={copyRoomId}>
              Copy Room ID
            </Button>
            <Button colorPalette="red" size="sm" w="full" onClick={leaveRoom}>
              Leave Room
            </Button>
          </VStack>
        </Flex>

        {/* Editor Area */}
        <Flex flex="1" direction="column" bg="gray.700">
          {/* Top Toolbar */}
          <Flex justify="space-between" align="center" bg="gray.800" p={2}>
            {/* Save to Local Button */}
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <Button size="xs" colorPalette="teal">
                  Save to Local <Download />
                </Button>
              </Dialog.Trigger>
              <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                  <Dialog.Content>
                    <Dialog.Header>
                      <Dialog.Title>Enter the name of the file</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                      <Input
                        placeholder="Enter file name"
                        value={fileNameInput}
                        onChange={(e) => setFileNameInput(e.target.value)}
                      />
                    </Dialog.Body>
                    <Dialog.Footer>
                      <Dialog.ActionTrigger asChild>
                        <Button variant="outline" ref={cancelRef}>
                          Cancel
                        </Button>
                      </Dialog.ActionTrigger>
                      <Button
                        colorScheme="teal"
                        ml={3}
                        onClick={() => {
                          handleSaveToLocal(fileNameInput);
                          setFileNameInput("");
                        }}
                        isDisabled={!fileNameInput.trim()}
                      >
                        Save
                      </Button>
                    </Dialog.Footer>
                    <Dialog.CloseTrigger asChild>
                      <CloseButton size="sm" />
                    </Dialog.CloseTrigger>
                  </Dialog.Content>
                </Dialog.Positioner>
              </Portal>
            </Dialog.Root>

            {/* Language selector */}
            <div className="bg-dark p-2 d-flex justify-content-end">
              <select
                placeholder={selectedLanguage}
                className="form-select w-auto"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </Flex>

          {/* Editor */}
          <Box flex="1" overflowY="auto" p={4}>
            <Editor
              socketRef={socketRef}
              roomId={roomId}
              language={selectedLanguage}
              onLanguageChange={(lang) => {
                setSelectedLanguage(lang);
              }}
              onCodeChange={(updatedCode) => {
                codeRef.current = updatedCode;
              }}
            />
          </Box>
        </Flex>
      </Flex>

      {/* Compiler Toggle Button */}
      <Button
        pos="fixed"
        bottom="4"
        right="4"
        colorPalette="blue"
        onClick={toggleCompileWindow}
        zIndex="1050"
      >
        {isCompileWindowOpen ? "Close Compiler" : "Open Compiler"}
      </Button>

      {/* Compiler Section */}
      <Box
        pos="fixed"
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
                Compiler Output (
                {selectedLanguage ? selectedLanguage : "JavaScript"})
              </Text>
              <HStack>
                <Button
                  colorPalette="green"
                  size="sm"
                  onClick={runCode}
                  loading={isCompiling}
                >
                  {isCompiling ? "Compiling..." : "Run Code"}
                </Button>
                <Button
                  colorPalette="gray"
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
