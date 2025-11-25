"use client"
import { Pie, Column } from '@ant-design/plots';
import { Card } from 'antd';

export const GenderPieChart = () => {
  const genderConfig = {
    data: [
      { type: 'Male', value: 68 },
      { type: 'Female', value: 32 }
    ],
    angleField: 'value',
    colorField: 'type',
    color: ['#4F46E5', '#A855F7'],
    radius: 0.8,
    label: {
      type: 'inner',
      offset: '-30%',
      content: '{percentage}',
      style: { fontSize: 18, fontWeight: 'bold', fill: '#fff' }
    },
    legend: { position: 'bottom' },
    height: 300,
  };

  return <Pie {...genderConfig} />;
};

export const AgeBarChart = () => {
  const ageConfig = {
    data: [
      { age: '0-5y', value: 12 },
      { age: '5-10y', value: 16 },
      // ... ข้อมูลอื่นๆ
      { age: '35+y', value: 9 }
    ],
    xField: 'age',
    yField: 'value',
    color: '#A855F7',
    height: 300
  };

  return <Column {...ageConfig} />;
};