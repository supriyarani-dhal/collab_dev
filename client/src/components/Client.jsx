import React from "react";
import { Avatar, Text } from "@chakra-ui/react";

const Client = ({ username }) => {
  return (
    <div className="d-flex align-items-center mb-3">
      <Avatar.Root>
        <Avatar.Fallback name={username.toString()} />
      </Avatar.Root>
      <Text fontWeight="medium">{username.toString()}</Text>
    </div>
  );
};

export default Client;
