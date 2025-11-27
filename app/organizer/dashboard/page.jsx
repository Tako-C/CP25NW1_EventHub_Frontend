'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { getData } from '@/libs/fetch';
import { useRouter } from 'next/navigation';

export default function ExhibitionSummary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const itemsPerPage = 5;
  const [totalCount, setTotalCount] = useState({
    count_exhibition: 0,
    count_exhibitior: 0,
    count_visitor: 0,
  });
  const router = useRouter();

  const formatDateAndDuration = (start, end) => {
    if (!start || !end) return { dateStr: '-', days: 0 };

    const startDate = new Date(start);
    const endDate = new Date(end);

    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const startStr = startDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    });
    const endStr = endDate.toLocaleDateString('en-GB', options);

    return {
      dateStr: `${startStr} - ${endStr}`,
      days: diffDays,
    };
  };

  const fetchData = async () => {
    try {
      const res = await getData('users/me/registered-events');
      const organizer_event =
        res?.data.filter((event) => event?.eventRole === 'ORGANIZER') || [];

      setData(organizer_event);
      console.log(organizer_event);

      setTotalCount({
        count_exhibition: organizer_event.length,
        count_exhibitior: 0,
        count_visitor: 0,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredExhibitions = data.filter(
    (item) =>
      item.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredExhibitions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredExhibitions.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-purple-600 mb-8">
          Summary Data
        </h1>

        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl border-2 border-gray-300 p-6">
            <h2 className="text-xl font-bold mb-4">Total Exhibition</h2>
            <p className="text-5xl font-bold text-indigo-600 text-right">
              {totalCount?.count_exhibition || 0}
            </p>
          </div>
          <div className="bg-white rounded-2xl border-2 border-gray-300 p-6">
            <h2 className="text-xl font-bold mb-4">Total Exhibitor</h2>
            <p className="text-5xl font-bold text-indigo-600 text-right">
              {totalCount?.count_exhibitor || 0}
            </p>
          </div>
          <div className="bg-white rounded-2xl border-2 border-gray-300 p-6">
            <h2 className="text-xl font-bold mb-4">Total Visitor</h2>
            <p className="text-5xl font-bold text-indigo-600 text-right">
              {totalCount?.count_visitor || 0}
            </p>
          </div>
        </div> */}

        <div className="bg-white rounded-lg border border-gray-200 p-2 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search Event Name, Location"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-0 focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Date ↑
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Event Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Role
                  </th>
                  {/* <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Status
                  </th> */}
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((item, index) => {
                    // คำนวณวันที่และระยะเวลาตรงนี้
                    const { dateStr, days } = formatDateAndDuration(
                      item.startDate,
                      item.endDate
                    );

                    return (
                      <tr
                        key={item.eventId || index}
                        className="hover:bg-gray-50"
                        onClick={() =>
                          router.push(
                            `/organizer/dashboard/${item.eventId}/detail`
                          )
                        }
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="font-medium">{dateStr}</div>
                          {/* <div className="text-gray-500">({days} days)</div> */}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            {item.eventName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-purple-100 text-purple-700 text-xs font-medium px-3 py-1 rounded-full">
                            {item.eventRole}
                          </span>
                        </td>
                        {/* <td className="px-6 py-4 text-sm text-gray-900">
                          <span className="capitalize px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs">
                            {item.status.replace("_", " ")}
                          </span>
                        </td> */}
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.location}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No events found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Show: <span className="font-medium">{itemsPerPage}</span> 1-
              {Math.min(itemsPerPage, filteredExhibitions.length)} of{' '}
              {filteredExhibitions.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded ${
                    currentPage === i + 1
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
