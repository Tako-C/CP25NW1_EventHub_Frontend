"use client";
import { notification } from "antd";
export default function Notification(type, title, description, duration = 10) {
  return notification[type]({
    message: title,
    description: description,
    duration: duration
  });
}
