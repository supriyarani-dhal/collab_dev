import React from "react";
import { Avatar, HStack, Stack, Text } from "@chakra-ui/react";

const Client = ({ username }) => {
  return (
    <HStack key={username.toString()} gap="4">
      <Avatar.Root colorPalette={"blue"}>
        <Avatar.Fallback name={username.toString()} />
        <Avatar.Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ41A81cAVOwJ6e58SZMxg_Fh-VSwnYIWb3Bw&s" />
      </Avatar.Root>
      <Stack gap="0">
          <Text fontWeight="medium">{username.toString()}
          </Text>
          <Text color="fg.muted" textStyle="sm">
            {username.toString()}
          </Text>
      </Stack>
    </HStack>
  );
};

export default Client;
