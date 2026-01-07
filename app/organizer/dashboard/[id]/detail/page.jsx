'use client';

import { useState, useEffect } from 'react';
import { Card, Input, Table } from 'antd';
import { SearchOutlined, UserOutlined, MailOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getData, getListUser } from '@/libs/fetch';
import { useParams } from 'next/navigation';
import { FormatDate } from '@/utils/format';

export default function ExhibitionDashboard() {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [searchText, setSearchText] = useState('');

  const totalCheckedIn =
    data?.filter((item) => item.status === 'check_in').length || 0;

  const filteredData = data.filter((item) => 
    String(item.name || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'No.',
      dataIndex: 'no',
      key: 'no',
      width: 60,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Registration Date',
      dataIndex: 'registration_date',
      key: 'registration_date',
      render: (date) => FormatDate(date, 'datetime'),
    },
    {
      title: 'Check-in Date',
      dataIndex: 'check_in_at',
      key: 'check_in_at',
      render: (date) => {
        if (date) {
          return (
            <span className="text-green-600 font-medium">
              {FormatDate(date, 'datetime')}
            </span>
          );
        } else {
          return <span className="text-gray-400">-</span>;
        }
      },
    },
  ];

  const fetchData = async () => {
    try {
      const res = await getData('users/me/profile');
      const resListUser = await getListUser(
        'list/check-in',
        id,
        res?.data?.id
      );

      if (Array.isArray(resListUser?.data)) {
        const formattedData = resListUser.data.map((item, index) => ({
          ...item,
          key: index,
          no: index + 1,
        }));
        setData(formattedData);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-[#7C3AED] mb-6">
        Exhibition Name
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card
          variant="borderless" 
          className="rounded-xl border-2 border-[#f0f0f0] shadow-sm"
        >
          <div className="font-bold text-base md:text-lg mb-4 text-gray-700">
            Total Registration
          </div>
          <div className="text-4xl md:text-5xl font-bold text-[#6366F1] text-right">
            {data?.length || 0}
          </div>
        </Card>

        <Card
          variant="borderless"
          className="rounded-xl border-2 border-[#f0f0f0] shadow-sm"
        >
          <div className="font-bold text-base md:text-lg mb-4 text-gray-700">
            Total Checked-in
          </div>
          <div className="text-4xl md:text-5xl font-bold text-[#6366F1] text-right">
            {totalCheckedIn}
          </div>
        </Card>
      </div>

      <Card
        variant="borderless" 
        title={<span className="text-lg font-semibold">Participants</span>}
        className="rounded-xl border-2 border-[#f0f0f0] shadow-sm"
        styles={{ body: { padding: '24px' } }} 
      >
        <div className="mb-4">
          <Input
            placeholder="Search name..."
            prefix={<SearchOutlined />}
            className="w-full md:w-[250px] rounded-full"
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
            size="large"
          />
        </div>

        <div className="hidden md:block">
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={{ pageSize: 10 }}
            bordered
          />
        </div>

        <div className="md:hidden space-y-4">
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <div 
                key={item.key} 
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                      <UserOutlined className="text-purple-500" />
                      {item.name}
                    </h3>
                    <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                      <MailOutlined /> {item.email}
                    </p>
                  </div>
                  <span className="text-gray-400 text-xs font-mono">#{item.no}</span>
                </div>

                <div className="border-t border-gray-200 pt-3 flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Registered:</span>
                    <span>{FormatDate(item.registration_date, 'datetime')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Check-in:</span>
                    {item.check_in_at ? (
                      <span className="text-green-600 font-medium flex items-center gap-1">
                        <CheckCircleOutlined />
                        {FormatDate(item.check_in_at, 'datetime')}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              No participants found
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}