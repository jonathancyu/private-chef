import React from "react";
import {
  Box,
  HStack,
  Button,
  IconButton,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import { MdChevronLeft, MdChevronRight, MdToday } from "react-icons/md";
import { useAppContext } from "../context/AppContext";

interface DateSelectorProps {
  onDateChange?: (date: Date) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ onDateChange }) => {
  const { selectedDate, setSelectedDate } = useAppContext();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const goToToday = () => {
    const newDate = new Date();
    setSelectedDate(newDate);
    if (onDateChange) onDateChange(newDate);
  };

  const goToPrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
    if (onDateChange) onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
    if (onDateChange) onDateChange(newDate);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: isMobile ? "short" : "long",
      month: isMobile ? "numeric" : "long",
      day: "numeric",
    });
  };

  return (
    <Box mb={4}>
      <HStack spacing={2} justify="center">
        <IconButton
          icon={<MdChevronLeft />}
          aria-label="Previous day"
          onClick={goToPrevDay}
          variant="outline"
        />
        <Button leftIcon={<MdToday />} onClick={goToToday} variant="outline">
          Today
        </Button>
        <Box px={4} textAlign="center" minW="150px">
          <Text fontWeight="bold">{formatDate(selectedDate)}</Text>
        </Box>
        <IconButton
          icon={<MdChevronRight />}
          aria-label="Next day"
          onClick={goToNextDay}
          variant="outline"
        />
      </HStack>
    </Box>
  );
};

export default DateSelector;
