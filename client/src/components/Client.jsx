import React from "react";
import { Avatar, Box, Text, Flex } from "@chakra-ui/react";

function Client({ username }) {
  return (
    <Flex align="center" mb={3}>
      <Avatar name={username.toString()} size="md" mr={3} />
      <Text fontWeight="medium">{username.toString()}</Text>
    </Flex>
  );
}

export default Client;
