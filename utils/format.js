import dayjs from "dayjs";

export const FormatDate = (value, type = "date", pattern = "DD/MM/YYYY") => {
  if (type === "date") {
    return dayjs(value).format("DD/MM/YYYY");
  }
  if (type === "datetime") {
    return dayjs(value).format("DD/MM/YYYY HH:mm:ss");
  }
  if (type === "custom") {
    return dayjs(value).format(pattern);
  }
  if (type === "default") {
    return dayjs(value);
  }
  if (type === "utc") {
    return dayjs.utc(value).format(pattern || "DD/MM/YYYY");
  }
};
