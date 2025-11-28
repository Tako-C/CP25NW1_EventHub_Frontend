'use client';

import { useState, useEffect } from 'react';
import { Card, Input, Table, Tag, Skeleton } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';
import { getData, getListUser, getListUserByEvent } from '@/libs/fetch';
import { useParams } from 'next/navigation';
import { FormatDate } from '@/utils/format';

// const GenderPieChart = dynamic(() => import('./components/DashboardCharts').then(mod => mod.GenderPieChart), {
//   ssr: false,
//   loading: () => <Skeleton active paragraph={{ rows: 6 }} />
// });

// const AgeBarChart = dynamic(() => import('./components/DashboardCharts').then(mod => mod.AgeBarChart), {
//   ssr: false,
//   loading: () => <Skeleton active paragraph={{ rows: 6 }} />
// });

export default function ExhibitionDashboard() {
  const { id } = useParams();
  const [data, setData] = useState([]);
  const totalCheckedIn =
    data?.filter((item) => item.status === 'check_in').length || 0;

  const [searchText, setSearchText] = useState('');
  const genderConfig = {
    data: [
      { type: 'Male', value: 68 },
      { type: 'Female', value: 32 },
    ],
    angleField: 'value',
    colorField: 'type',
    color: ['#4F46E5', '#A855F7'],
    radius: 0.8,
    label: {
      type: 'inner',
      offset: '-30%',
      content: '{percentage}',
      style: {
        fontSize: 18,
        fontWeight: 'bold',
        fill: '#fff',
      },
    },
    legend: {
      position: 'bottom',
      itemName: {
        style: {
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
    },
    height: 300,
    statistic: null,
  };
  const ageConfig = {
    data: [
      { age: '0-5y', value: 12 },
      { age: '5-10y', value: 16 },
      { age: '10-15y', value: 17 },
      { age: '15-20y', value: 17 },
      { age: '20-25y', value: 14 },
      { age: '25-30y', value: 10 },
      { age: '30-35y', value: 6 },
      { age: '35+y', value: 9 },
    ],
    xField: 'age',
    yField: 'value',
    color: '#A855F7',
    label: {
      position: 'top',
      style: {
        fill: '#000',
        fontSize: 12,
        fontWeight: 'bold',
      },
    },
    xAxis: {
      label: {
        autoHide: false,
        autoRotate: false,
      },
    },
    height: 300,
  };

  const occupationData = [
    { name: 'อาชีพ 1', value: 50 },
    { name: 'อาชีพ 2', value: 40 },
    { name: 'อาชีพ 3', value: 30 },
    { name: 'อาชีพ 4', value: 20 },
    { name: 'อาชีพ 5', value: 10 },
  ];

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
      filteredValue: [searchText],
      onFilter: (value, record) => {
        return String(record.name).toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    // {
    //   title: "Gender",
    //   dataIndex: "gender",
    //   key: "gender",
    // },
    // {
    //   title: "Age",
    //   dataIndex: "age",
    //   key: "age",
    // },
    // {
    //   title: "Date",
    //   dataIndex: "date",
    //   key: "date",
    // },
    {
      title: 'Registration Date',
      dataIndex: 'registration_date',
      key: 'registration_date',
      render: (date) => {
        return FormatDate(date, 'datetime');
      },
    },
    {
      title: 'Check-in Date',
      dataIndex: 'check_in_at',
      key: 'check_in_at',
      render: (date, record) => {
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
      const resListUser = await getListUserByEvent(
        'list/check-in',
        id,
        res?.data?.id
      );

      console.log('res', res?.data);
      console.log('resListUser', resListUser?.data);

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
    <div
      style={{
        padding: '24px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
      }}
      className="max-w-7xl mx-auto"
    >
      <h1
        style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#7C3AED',
          marginBottom: '24px',
        }}
      >
        Exhibition Name
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <Card
          variant="outlined"
          style={{ borderRadius: '12px', borderWidth: '2px' }}
        >
          <div
            style={{
              fontWeight: 'bold',
              fontSize: '18px',
              marginBottom: '16px',
            }}
          >
            Total Registration
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#6366F1',
              textAlign: 'right',
            }}
          >
            {data?.length || 0}
          </div>
        </Card>
        {/* <Card
          variant="outlined"
          style={{ borderRadius: '12px', borderWidth: '2px' }}
        >
          <div
            style={{
              fontWeight: 'bold',
              fontSize: '18px',
              marginBottom: '16px',
            }}
          >
            Total Exhibitors
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#6366F1',
              textAlign: 'right',
            }}
          >
            0
          </div>
        </Card> */}
        <Card
          variant="outlined"
          style={{ borderRadius: '12px', borderWidth: '2px' }}
        >
          <div
            style={{
              fontWeight: 'bold',
              fontSize: '18px',
              marginBottom: '16px',
            }}
          >
            Total Checked-in
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#6366F1',
              textAlign: 'right',
            }}
          >
            {totalCheckedIn}
          </div>
        </Card>
      </div>

      {/* <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        <Card title="Gender Visitor" variant="outlined" style={{ borderRadius: '12px', borderWidth: '2px' }}>
          <GenderPieChart />
        </Card>

        <Card title="Age" variant="outlined" style={{ borderRadius: '12px', borderWidth: '2px' }}>
           <AgeBarChart />
        </Card>

      </div> */}

      <Card
        title="Participants"
        variant="outlined"
        style={{ borderRadius: '12px', borderWidth: '2px' }}
      >
        <Input
          placeholder="Search ..."
          prefix={<SearchOutlined />}
          style={{ marginBottom: '16px', width: '250px', borderRadius: '20px' }}
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
        />
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          bordered
        />
      </Card>
    </div>
  );
}
