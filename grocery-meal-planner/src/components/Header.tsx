import React from "react";
import {
  Box,
  Flex,
  Text,
  IconButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  Button,
} from "@chakra-ui/react";
import { MdWbSunny, MdNightsStay, MdPerson } from "react-icons/md";
import { useAppContext } from "../context/AppContext";

const Header: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { selectedDate, setSelectedDate } = useAppContext();

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      px={6}
      py={4}
      borderBottomWidth="1px"
      borderBottomColor="gray.200"
    >
      <Text fontSize="lg" fontWeight="medium">
        {formatDate(selectedDate)}
      </Text>
      <Flex alignItems="center">
        <IconButton
          aria-label={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`}
          icon={colorMode === "light" ? <MdNightsStay /> : <MdWbSunny />}
          variant="ghost"
          onClick={toggleColorMode}
          mr={4}
        />
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<Avatar size="sm" icon={<MdPerson />} />}
            variant="ghost"
            aria-label="User menu"
          />
          <MenuList>
            <MenuItem>Profile</MenuItem>
            <MenuItem>Settings</MenuItem>
            <MenuItem>Logout</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
};

export default Header;
