import React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Box, VStack, Link, Icon, Divider, Text } from "@chakra-ui/react";
import {
  MdDashboard,
  MdRestaurantMenu,
  MdCalendarToday,
  MdShoppingCart,
  MdKitchen,
  MdFastfood,
  MdAssessment,
} from "react-icons/md";

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/", icon: MdDashboard },
    { name: "Recipes", path: "/recipes", icon: MdRestaurantMenu },
    { name: "Meal Planning", path: "/meal-planning", icon: MdCalendarToday },
    { name: "Inventory", path: "/inventory", icon: MdShoppingCart },
    { name: "Cook Meal", path: "/cook-meal", icon: MdKitchen },
    { name: "Eaten Meals", path: "/eaten-meals", icon: MdFastfood },
    { name: "Macros", path: "/macros", icon: MdAssessment },
  ];

  return (
    <Box
      bg="brand.700"
      color="white"
      w="240px"
      py={6}
      h="100vh"
      overflowY="auto"
    >
      <VStack spacing={1} align="stretch">
        <Box px={4} mb={6}>
          <Text fontSize="xl" fontWeight="bold">
            Meal Planner Pro
          </Text>
        </Box>
        <Divider opacity={0.2} />
        <VStack spacing={1} align="stretch" mt={4}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              as={RouterLink}
              to={item.path}
              px={4}
              py={3}
              borderRadius="md"
              _hover={{ bg: "brand.600" }}
              bg={location.pathname === item.path ? "brand.500" : "transparent"}
              display="flex"
              alignItems="center"
            >
              <Icon as={item.icon} mr={3} />
              <Text>{item.name}</Text>
            </Link>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
};

export default Sidebar;
