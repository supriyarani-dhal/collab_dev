import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  Link,
  Image,
} from "@chakra-ui/react";
import logo from "../assets/logo.png";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toaster } from "./ui/toaster";

const Home = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  const generateRoomID = (e) => {
    e.preventDefault();
    const Id = uuidv4();
    setRoomId(Id);
    toaster.create({
      title: "Room Id is generated",
      type: "success",
    });
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toaster.create({
        title: "Both the field is requried",
        type: "error",
      });
      return;
    }

    // redirect
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
    toaster.create({
      title: "room is created",
      type: "success",
    });
  };

  // when enter then also join
  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <Box
      width="600px"
      height={"400px"}
      bg="gray.900"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        bg="gray.800"
        p={10}
        rounded="lg"
        boxShadow="2xl"
        width="100%"
        height={"400px"}
        maxW="600px" // <-- Increased the width
      >
        {/* Logo or Title */}
        <Box display="flex" justifyContent="center" mb={4}>
          <Image
            src={logo}
            alt="Collab Dev Logo"
            boxSize="120px"
            objectFit="contain"
          />
        </Box>

        {/* Form */}
        <VStack spacing={10}>
          <Input
            placeholder="Room Id"
            value={roomId}
            bg="gray.700"
            color="white"
            _placeholder={{ color: "gray.400" }}
            _focus={{ borderColor: "teal.400", bg: "gray.600" }}
            size={"lg"}
            onChange={(e) => setRoomId(e.target.value)}
            onKeyUp={handleInputEnter}
          />
          <Input
            placeholder="Username"
            value={username}
            bg="gray.700"
            color="white"
            _placeholder={{ color: "gray.400" }}
            _focus={{ borderColor: "teal.400", bg: "gray.600" }}
            size="lg"
            onChange={(e) => setUsername(e.target.value)}
            onKeyUp={handleInputEnter}
          />
          <Button
            colorScheme="teal"
            width="100%"
            size={"lg"}
            color={"white"}
            onClick={joinRoom}
          >
            JOIN
          </Button>
        </VStack>

        {/* Link */}
        <Text mt={6} textAlign="center" color="gray.400" fontSize="md">
          Don't have a room Id?{" "}
          <Link color="teal.300" href="#" onClick={generateRoomID}>
            Create New Room
          </Link>
        </Text>
      </Box>
    </Box>
  );
};

export default Home;
