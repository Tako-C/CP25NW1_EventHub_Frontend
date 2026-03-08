"use client";
import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Input,
  Card,
  Modal,
  Form,
  DatePicker,
  Upload,
  message,
  Popconfirm,
  Image
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UndoOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { 
  getData, 
  getUpdateImage, 
  getImage, 
  updateEvent, 
  createEvent 
} from "@/libs/fetch";

dayjs.extend(utc);

function TableImage({ imagePath }) {
  const [imgUrl, setImgUrl] = useState(null);

  useEffect(() => {
    if (!imagePath) return;
    const fetchImg = async () => {
      try {
        let cleanPath = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath;
        const finalPath = cleanPath.startsWith("upload/events/") 
          ? cleanPath 
          : `upload/events/${cleanPath}`;
        
        const res = await getImage(finalPath); 
        setImgUrl(res);
      } catch (err) {
        console.error("Table image load failed", err);
      }
    };
    fetchImg();
  }, [imagePath]);

  return imgUrl ? (
    <Image width={60} src={imgUrl} className="rounded shadow-sm" />
  ) : (
    <div className="w-[60px] h-[40px] bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-400">
      No Pic
    </div>
  );
}

export default function EventsManagement() {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false); 
  const [editingId, setEditingId] = useState(null);
  const [data, setData] = useState(null);

  const loadAndFormatImage = async (imgFilename, uidSuffix) => {
    if (!imgFilename) return [];
    try {
      let fetchPath = imgFilename;
      if (!fetchPath.startsWith("upload/events") && !fetchPath.includes("/")) {
        fetchPath = `upload/events/${fetchPath}`;
      }
      if (fetchPath.startsWith("/")) fetchPath = fetchPath.substring(1);

      const blobUrl = await getUpdateImage(fetchPath); 
      if (!blobUrl) return [];

      return [
        {
          uid: `-existing-${uidSuffix}`,
          name: imgFilename,
          status: "done",
          url: blobUrl,
          thumbUrl: blobUrl,
        },
      ];
    } catch (err) {
      return [];
    }
  };

  const handleEdit = async (record) => {
    setEditingId(record.id);
    setFetching(true);
    try {
      const imgData = record.images || {};
      const slides = imgData.imgSlideShow || [];

      const [fileCard, fileDetail, fileMap, s1, s2, s3] = await Promise.all([
        loadAndFormatImage(imgData.imgCard, "card"),
        loadAndFormatImage(imgData.imgDetail, "detail"),
        loadAndFormatImage(imgData.imgMap, "map"),
        loadAndFormatImage(slides[0], "slide1"),
        loadAndFormatImage(slides[1], "slide2"),
        loadAndFormatImage(slides[2], "slide3"),
      ]);

      form.setFieldsValue({
        ...record,
        eventType: record.eventTypeId?.id,
        hostOrganization: record.hostOrganisation, 
        eventDescription: record.eventDesc,
        startDate: record.startDate ? dayjs.utc(record.startDate).local() : null,
        endDate: record.endDate ? dayjs.utc(record.endDate).local() : null,
        eventCard: fileCard,
        eventDetail: fileDetail,
        eventMap: fileMap,
        slideshowSlot1: s1,
        slideshowSlot2: s2,
        slideshowSlot3: s3,
      });
      setIsModalOpen(true);
    } finally {
      setFetching(false);
    }
  };

  const onFinish = async (values) => {
    // setLoading(true);
    // try {
    //   const formData = new FormData();
    //   formData.append("eventName", values.eventName || "");
    //   formData.append("eventDesc", values.eventDescription || "");
    //   formData.append("eventTypeId", values.eventType || "");
    //   formData.append("hostOrganisation", values.hostOrganization || "");
    //   formData.append("location", values.location || "");
    //   formData.append("contactEmail", values.contactEmail || "");
    //   formData.append("contactPhone", values.contactPhone || "");
    //   formData.append("contactLine", values.contactLine || "");
    //   formData.append("contactFacebook", values.contactFacebook || "");

    //   if (values.startDate)
    //     formData.append("startDate", values.startDate.utc().format("YYYY-MM-DDTHH:mm:ss"));
    //   if (values.endDate)
    //     formData.append("endDate", values.endDate.utc().format("YYYY-MM-DDTHH:mm:ss"));

    //   if (values.eventCard?.[0]?.originFileObj)
    //     formData.append("eventCard", values.eventCard[0].originFileObj);
    //   if (values.eventDetail?.[0]?.originFileObj)
    //     formData.append("eventDetail", values.eventDetail[0].originFileObj);
    //   if (values.eventMap?.[0]?.originFileObj)
    //     formData.append("eventMap", values.eventMap[0].originFileObj);

    //   const indices = [];
    //   ["slideshowSlot1", "slideshowSlot2", "slideshowSlot3"].forEach((slot, idx) => {
    //       if (values[slot]?.[0]?.originFileObj) {
    //         formData.append("eventSlideshow", values[slot][0].originFileObj);
    //         indices.push(idx + 1);
    //       }
    //   });
    //   if (indices.length > 0) indices.forEach(idx => formData.append("slideshowIndices", idx));

    //   if (editingId) {
    //     await updateEvent(editingId, formData);
    //     message.success("อัปเดตข้อมูลสำเร็จ");
    //   } else {
    //     await createEvent(formData);
    //     message.success("สร้างกิจกรรมสำเร็จ");
    //   }

    //   setIsModalOpen(false);
    //   fetchData();
    // } catch (error) {
    //   message.error("เกิดข้อผิดพลาดในการบันทึก");
    // } finally {
    //   setLoading(false);
    // }
  };

  const columns = [
    {
      title: "Preview",
      key: "preview",
      width: 100,
      render: (_, record) => <TableImage imagePath={record.images?.imgCard} />,
    },
    { title: "Event Name", dataIndex: "eventName", key: "eventName" },
    {
      title: "Type",
      dataIndex: ["eventTypeId", "eventTypeName"],
      render: (type) => <Tag color="blue">{type}</Tag>
    },
    {
      title: "Status",
      dataIndex: "eventStatus",
      render: (s) => (
        <Tag color={s === "ONGOING" ? "green" : s === "FINISHED" ? "volcano" : "grey"}>
          {s}
        </Tag>
      ),
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            loading={fetching && editingId === record.id}
          />
          <Popconfirm
            title="ลบกิจกรรมนี้หรือไม่?"
            onConfirm={() => message.info("Deleted")}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const fetchData = async () => {
    const res = await getData("admin/events");
    console.log(res?.data)
    setData(res?.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 bg-slate-50 min-h-screen mt-20">
      <Card
        title={<span className="text-xl font-bold">Event Management System</span>}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
            className="bg-blue-600"
          >
            Create Event
          </Button>
        }
      >
        <Table columns={columns} dataSource={data} rowKey="id" />
      </Card>

      <Modal
        title={editingId ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรมใหม่"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={800}
        confirmLoading={loading || fetching}
        okText="Save Changes"
        okButtonProps={{ icon: <SaveOutlined />, className: "bg-blue-600" }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} className="mt-4">
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item name="eventName" label="Event Name" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="hostOrganization" label="Host Organization"><Input /></Form.Item>
            <Form.Item name="location" label="Location"><Input /></Form.Item>
            <Form.Item name="eventType" label="Event Type (ID)"><Input /></Form.Item>
            <Form.Item name="startDate" label="Start Date"><DatePicker showTime className="w-full" /></Form.Item>
            <Form.Item name="endDate" label="End Date"><DatePicker showTime className="w-full" /></Form.Item>
          </div>
          <Form.Item name="eventDescription" label="Description"><Input.TextArea rows={3} /></Form.Item>

          <h3 className="font-bold mb-2 border-b pb-1">Media (Images)</h3>
          <div className="grid grid-cols-3 gap-4">
            {["eventCard", "eventDetail", "eventMap"].map((name) => (
              <Form.Item
                key={name}
                name={name}
                label={name.replace("event", "") + " Image"}
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e.slice(-1) : e?.fileList?.slice(-1))}
              >
                <Upload listType="picture-card" maxCount={1} beforeUpload={() => false}>
                  <PlusOutlined />
                  <div>Upload</div>
                </Upload>
              </Form.Item>
            ))}
          </div>

          <h3 className="font-bold mb-2 border-b pb-1 mt-4">Slideshow Slots</h3>
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <Form.Item
                key={i}
                name={`slideshowSlot${i}`}
                label={`Slide ${i}`}
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e.slice(-1) : e?.fileList?.slice(-1))}
              >
                <Upload listType="picture-card" maxCount={1} beforeUpload={() => false}>
                  <PlusOutlined />
                </Upload>
              </Form.Item>
            ))}
          </div>
        </Form>
      </Modal>
    </div>
  );
}