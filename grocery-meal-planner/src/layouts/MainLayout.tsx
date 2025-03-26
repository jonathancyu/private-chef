import React from "react";
import { Outlet } from "react-router-dom";
import { Box, Flex, VStack, Heading, Text } from "@chakra-ui/react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const MainLayout: React.FC = () => {
  return (
    <Flex h="100vh">
      <Sidebar />
      <Box flex="1" overflow="auto">
        <Header />
        <Box as="main" p={4}>
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};

export default MainLayout;
