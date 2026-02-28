import { QrCode, X, Download, CheckCircle, ScanLine } from 'lucide-react';
import { getImage } from '@/libs/fetch';
import { useState, useEffect } from 'react';

function QrCodeModal({ isOpen, onClose, image, qrCodeUrl, isEnded }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 animate-fade-in">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 z-10 max-w-sm w-full mx-auto overflow-hidden animate-scale-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all z-20"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center pt-2 pb-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Check-in Ticket
          </h3>
          <p className="text-gray-500 text-sm mb-6 px-4">
            Scan this QR code at the event entrance.
          </p>

          <div className="p-5 bg-white border-2 border-dashed border-purple-200 rounded-2xl shadow-sm mb-6 relative group w-full max-w-[260px]">
            <div className="aspect-square relative flex items-center justify-center overflow-hidden rounded-lg">
              {image ? (
                <img
                  src={image}
                  alt="QR Code"
                  className={`w-full h-full object-contain transition-opacity duration-300 ${
                    isEnded ? 'opacity-30 grayscale' : ''
                  }`}
                />
              ) : (
                <QrCode size={120} className="text-gray-300" />
              )}

              {/* Overlay ถ้างานจบแล้ว */}
              {isEnded && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="bg-white/90 backdrop-blur-sm border border-red-100 px-4 py-2 rounded-full shadow-sm">
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-500 rounded-full inline-block animate-pulse"></span>
                      Event Ended
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ปุ่ม Action Group */}
          <div className="flex flex-col gap-3 w-full">
            <DownloadQrButton qrUrl={image} />
          </div>
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
  if (!qrUrl) return null;
  return (
    <a
      href={qrUrl}
      download="event-ticket-qr.png"
      className="w-full py-3 rounded-full font-medium bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg transition-all active:scale-95 text-sm tracking-wide flex items-center justify-center gap-2"
    >
      <Download size={18} />
      Download QR Code
    </a>
  );
}

export function QrCodeImage({ qrCodeUrl, isEnded, status }) {
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isCheckedIn = status === 'CHECK_IN';

  useEffect(() => {
    if (qrCodeUrl) {
      const fetchImage = async () => {
        try {
          const res = await getImage(
            qrCodeUrl.startsWith('/') ? qrCodeUrl.substring(1) : qrCodeUrl
          );
          setImage(res);
        } catch (error) {
          console.error('Error fetching QR code image:', error);
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

  if (isCheckedIn) {
    return (
      <div className="relative w-24 h-24 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center group select-none">
        {currentImageSource ? (
          <img
            src={currentImageSource}
            alt="Used QR"
            className="absolute inset-0 w-full h-full object-contain opacity-10 blur-[1px] grayscale"
          />
        ) : (
          <QrCode size={40} className="text-gray-300 opacity-20" />
        )}
        <div className="z-10 flex flex-col items-center justify-center">
          <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center mb-1 shadow-sm">
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <span className="text-[11px] text-green-700 uppercase tracking-wider">
            Used
          </span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-24 h-24 flex items-center justify-center bg-gray-50 rounded-xl animate-pulse">
        <QrCode size={24} className="text-gray-300" />
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
      <div className="flex flex-col items-center gap-1">
        <div
          className={`group relative w-24 h-24 p-1 cursor-pointer transition-all duration-300 ${
            isEnded
              ? 'opacity-50 grayscale cursor-not-allowed'
              : 'hover:scale-105'
          }`}
          onClick={() => !isEnded && setIsModalOpen(true)}
        >
          {currentImageSource ? (
            <img
              src={currentImageSource}
              alt="QR Code"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
              <QrCode size={48} className="text-black/80" />
            </div>
          )}
        </div>

        <div className="mt-1 flex items-center gap-1.5 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
            Not Check-in
          </span>
        </div>

        <p
          className="text-[10px] text-gray-400 cursor-pointer hover:text-purple-600 mt-0.5"
          onClick={() => !isEnded && setIsModalOpen(true)}
        >
          Click to enlarge
        </p>

        <QrCodeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          image={currentImageSource}
          qrCodeUrl={qrCodeUrl}
        />
      </div>
    );
  }
}

export function EventCardImage({ imageCard, eventName }) {
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!imageCard) {
      setIsLoading(false);
      return;
    }

    let targetPath = Array.isArray(imageCard) ? imageCard[0] : imageCard;
    if (typeof targetPath === 'string' && targetPath.includes(',')) {
      targetPath = targetPath.split(',')[0].trim();
    }

    if (!targetPath || typeof targetPath !== 'string') {
      setIsLoading(false);
      return;
    }

    if (targetPath.startsWith('blob:') || targetPath.startsWith('http')) {
      setImage(targetPath);
      setIsLoading(false);
      return;
    }

    const fetchImage = async () => {
      try {
        const cleanPath = targetPath.startsWith('/') ? targetPath.substring(1) : targetPath;
        const finalPath = cleanPath.startsWith('upload/events/') ? cleanPath : `upload/events/${cleanPath}`;

        const res = await getImage(finalPath);
        setImage(res);
      } catch (error) {
        setImage(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [imageCard]); 

  if (isLoading) {
    return <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
      <span className="text-gray-400 text-xs text-center px-2">{eventName}</span>
    </div>;
  }

  if (!image) return <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Pic</div>;

  return <img src={image} alt={eventName} className="w-full h-full object-cover" />;
}
export function RewardImage({ imagePath, rewardName }) {
  console.log(imagePath)
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!imagePath) {
      setIsLoading(false);
      return;
    }

    const fetchImage = async () => {
      try {
        const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
        const finalPath = cleanPath.startsWith('upload/events/') ? cleanPath : `upload/events/${cleanPath}`;
        console.log(finalPath)
        const res = await getImage(finalPath);
        setImage(res);
      } catch (error) {
        setImage(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [imagePath]);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
        <span className="text-gray-400 text-xs text-center px-2">{rewardName}</span>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
        No Pic
      </div>
    );
  }

  return <img src={image} alt={rewardName} className="w-full h-full object-cover" />;
}