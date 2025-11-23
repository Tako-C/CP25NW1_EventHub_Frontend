import { QrCode } from "lucide-react";
import { getImage } from "@/libs/fetch";
import { useState, useEffect } from "react";

export function QrCodeImage({ qrCodeUrl, isEnded }) {
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (qrCodeUrl) {
      const fetchImage = async () => {
        try {
          const res = await getImage(
            qrCodeUrl.startsWith("/") ? qrCodeUrl.substring(1) : qrCodeUrl
          );
          setImage(res);
        } catch (error) {
          console.error("Error fetching QR code image:", error);
          setImage(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchImage();
    } else {
      setIsLoading(false);
    }
  }, [qrCodeUrl]);

  if (isLoading) {
    return (
      <div
        className={`w-20 h-20 flex items-center justify-center ${
          isEnded ? "opacity-30" : "border-4 border-black p-2 bg-white"
        }`}
      >
        <QrCode
          size={80}
          className={`${isEnded ? "text-gray-800" : "text-black"}`}
        />
      </div>
    );
  }

  if (isEnded) {
    return (
      <>
        <div className="opacity-30 mb-2">
          {image ? (
            <img
              src={image}
              alt="QR Code"
              className="w-20 h-20 object-contain"
            />
          ) : (
            <QrCode size={80} className="text-gray-800" />
          )}
        </div>
        <span className="text-red-600 font-bold text-xl">Expired</span>
      </>
    );
  } else {
    return (
      <div className="border-4 border-black p-2 bg-white">
        {image ? (
          <img src={image} alt="QR Code" className="w-20 h-20 object-contain" />
        ) : (
          <QrCode size={80} className="text-black" />
        )}
      </div>
    );
  }
}



export function EventCardImage({ imageCard, eventName }) {
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (imageCard) {
      const fetchImage = async () => {
        try {
          const path = imageCard.startsWith("/")
            ? imageCard.substring(1)
            : imageCard;
          const res = await getImage(`upload/events/${path}`);
          setImage(res);
        } catch (error) {
          console.error("Error fetching event card image:", error);
          setImage(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchImage();
    } else {
      setIsLoading(false);
    }
  }, [imageCard]);

  if (isLoading || !image) {
    return (
      <span className="text-gray-500 font-semibold text-lg">Event Pic</span>
    );
  }
  return (
    <img src={image} alt={eventName} className="w-full h-full object-cover" />
  );
}