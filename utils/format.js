import dayjs from "dayjs";
import "dayjs/locale/th"; 
import utc from "dayjs/plugin/utc"; 
import timezone from "dayjs/plugin/timezone"; 

dayjs.extend(utc);
dayjs.extend(timezone);

export const FormatDate = (value, type = "date", pattern = "DD/MM/YYYY") => {
  if (!value) return "-";

  const date = dayjs.utc(value).local().locale("th");

  if (type === "date") {
    return date.format("DD/MM/YYYY");
  }
  if (type === "datetime") {
    return date.format("DD/MM/YYYY HH:mm:ss");
  }
  if (type === "thaiFull") {
    return date.add(543, "year").format("D MMMM YYYY HH:mm");
  }
  if (type === "thaiShort") {
    return date.add(543, "year").format("D MMM YYYY");
  }
  if (type === "custom") {
    return date.format(pattern);
  }
  if (type === "default") {
    return date;
  }
  if (type === "utc") {
    return dayjs.utc(value).format(pattern || "DD/MM/YYYY");
  }
};

export const formatForInput = (value) => {
  if (!value) return "";
  return dayjs.utc(value).local().format("YYYY-MM-DDTHH:mm");
};

export const formatToISO = (value) => {
  if (!value) return null;
  return dayjs(value).utc().format("YYYY-MM-DDTHH:mm:ss");
};