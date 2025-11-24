import { QrCode, X } from "lucide-react";
import { getImage } from "@/libs/fetch";
import { useState, useEffect } from "react";

function QrCodeModal({ isOpen, onClose, image, qrCodeUrl }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-8 max-w-md relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-bold mb-4">QR Code</h3>
          <div className="border-4 border-black p-4 bg-white">
            {image ? (
              <img src={image} alt="QR Code" className="w-64 h-64 object-contain" />
            ) : (
              <QrCode size={256} className="text-black" />
            )}
          </div>
          <p className="mt-4 text-sm text-gray-500">Scan this QR code to check-in</p>
          <DownloadQrButton qrUrl={image} />
        </div>
      </div>
    </div>
  );
}


// export function QrCodeImage({ qrCodeUrl, isEnded }) {
//   const [image, setImage] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   useEffect(() => {
//     if (qrCodeUrl) {
//       const fetchImage = async () => {
//         try {
//           const res = await getImage(
//             qrCodeUrl.startsWith("/") ? qrCodeUrl.substring(1) : qrCodeUrl
//           );
//           setImage(res);
//         } catch (error) {
//           console.error("Error fetching QR code image:", error);
//           setImage(null);
//         } finally {
//           setIsLoading(false);
//         }
//       };
//       fetchImage();
//     } else {
//       setIsLoading(false);
//     }
//   }, [qrCodeUrl]);

//   if (isLoading) {
//     return (
//       <div
//         className={`w-20 h-20 flex items-center justify-center ${
//           isEnded ? "opacity-30" : "border-4 border-black p-2 bg-white"
//         }`}
//       >
//         <QrCode
//           size={80}
//           className={`${isEnded ? "text-gray-800" : "text-black"}`}
//         />
//       </div>
//     );
//   }

//   if (isEnded) {
//     return (
//       <>
//         <div className="opacity-30 mb-2">
//           {image ? (
//             <img
//               src={image}
//               alt="QR Code"
//               className="w-20 h-20 object-contain"
//             />
//           ) : (
//             <QrCode size={80} className="text-gray-800" />
//           )}
//         </div>
//         <span className="text-red-600 font-bold text-xl">Expired</span>
//       </>
//     );
//   } else {
//     return (
//       <>
//         <div className="border-4 border-black p-2 bg-white">
//           {image ? (
//             <img
//               src={image}
//               alt="QR Code"
//               className="w-20 h-20 object-contain"
//             />
//           ) : (
//             <QrCode size={80} className="text-black" />
//           )}
//         </div>
//         <QrCodeModal
//           isOpen={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//           image={image}
//           qrCodeUrl={qrCodeUrl}
//         />
//       </>
//     );
//   }
// }

function DownloadQrButton({ qrUrl }) {
  return (
    <a
      href={qrUrl}
      download
      className="px-4 py-2 bg-blue-600 text-white rounded-md"
    >
      ดาวน์โหลด QR Code
    </a>
  );
}

export function QrCodeImage({ qrCodeUrl, isEnded }) {
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const getImageUrl = () => {
    return image || qrCodeUrl;
  };

  const currentImageSource = getImageUrl();

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
          {currentImageSource ? (
            <img
              src={currentImageSource}
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
      <>
        <div 
          className="border-4 border-black p-2 bg-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setIsModalOpen(true)}
        >
          {currentImageSource ? (
            <img 
              src={currentImageSource} 
              alt="QR Code" 
              className="w-20 h-20 object-contain" 
            />
          ) : (
            <QrCode size={80} className="text-black" />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">Click to enlarge</p>
        <QrCodeModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          image={currentImageSource} 
          qrCodeUrl={qrCodeUrl}
        />
      </>
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
