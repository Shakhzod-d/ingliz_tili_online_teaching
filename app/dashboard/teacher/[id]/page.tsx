'use client';

import axios from 'axios';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProfileEdit() {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>({});
  const [availableDays, setAvailableDays] = useState<{ [key: string]: string[] }>({});
  const [ordersList, setOrdersList] = useState<any[]>([]);

  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://48b745c40cead56f.mokky.dev/users/' + id);
        setData(response.data);
        setAvailableDays(response.data.availableDays);
        setOrdersList(response.data.lessons);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleDayChange = (day: string, time: string) => {
    setAvailableDays((prev) => {
      const times = prev?.[day] || [];
      if (times.includes(time)) {
        return { ...prev, [day]: times.filter((t) => t !== time) };
      } else {
        return { ...prev, [day]: [...times, time] };
      }
    });
  };

  // LocalStorage dan studentId ni oling
  const studentId = localStorage.getItem('studentId');
  if (!studentId) {
    alert('Student ID not found');
    return;
  }

  const handleAcceptOrCancel = async (lessonId: number, status: 'accepted' | 'canceled') => {
    // Update the teacher's orders list in the component state
    const updatedOrders = ordersList.map((lesson) =>
      lesson.lessonId === lessonId ? { ...lesson, isAccepted: status, status: 'viewed' } : lesson,
    );
    setOrdersList(updatedOrders);

    try {
      // Update the teacher's data on the backend
      await axios.patch(`https://48b745c40cead56f.mokky.dev/users/${id}`, {
        lessons: updatedOrders,
      });
      console.log('Teacher orders updated successfully');

      // Fetch the student ID associated with the lesson
      const lesson = ordersList.find((lesson) => lesson.lessonId === lessonId);
      if (lesson) {
        // Update the student's orders data
        await axios.patch(`https://48b745c40cead56f.mokky.dev/users/${lesson.studentId}`, {
          orders: updatedOrders.map((order) =>
            order.lessonId === lessonId
              ? { ...order, isAccepted: status, status: 'viewed' }
              : order,
          ),
        });
        console.log('Student orders updated successfully');
      }
    } catch (error) {
      console.error('Failed to update orders:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profileData = {
      ...data,
      availableDays,
      isActive: true,
    };
    console.log('Final Profile Data:', profileData);
    axios.patch('https://48b745c40cead56f.mokky.dev/users/' + id, profileData);
  };

  if (loading) {
    return <p>loading...</p>;
  }

  return (
    <div>
      <h2>Edit your profile</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full name"
          required
          value={data.name || ''}
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          required
          value={data.price || ''}
          onChange={(e) => setData({ ...data, price: e.target.value })}
        />

        <h3>Select Available Days and Times</h3>
        {/* Available days code */}
        {daysOfWeek.map((day) => (
          <div key={day}>
            <p>{day}</p>
            <label>
              <input
                type="checkbox"
                onChange={() => handleDayChange(day, 'Morning')}
                checked={availableDays?.[day]?.includes('Morning') || false}
              />
              Morning
            </label>
            <label>
              <input
                type="checkbox"
                onChange={() => handleDayChange(day, 'Afternoon')}
                checked={availableDays?.[day]?.includes('Afternoon') || false}
              />
              Afternoon
            </label>
            <label>
              <input
                type="checkbox"
                onChange={() => handleDayChange(day, 'Evening')}
                checked={availableDays?.[day]?.includes('Evening') || false}
              />
              Evening
            </label>
          </div>
        ))}

        <button type="submit">Save</button>
      </form>

      <div>
        <h2>Orders</h2>
        {ordersList.map((item) => (
          <div
            key={item.studentId}
            style={{
              border: '2px solid red',
              display: 'inline-block',
              padding: '15px',
              margin: '40px',
            }}
          >
            {item.status === 'new' && <b style={{ color: 'green' }}>NEW</b>}
            <p>Student: {item.studentId}</p>
            <p>Day: {item.day}</p>
            <p>Time: {item.time}</p>
            <p>Message: {item.comment}</p>
            <p>
              Lesson Status: <b style={{ color: 'red' }}>{item.lessonStatus}</b>
            </p>
            {item.isAccepted === 'new' ? (
              <div>
                <button onClick={() => handleAcceptOrCancel(item.lessonId, 'canceled')}>
                  Cancel
                </button>
                <button onClick={() => handleAcceptOrCancel(item.lessonId, 'accepted')}>
                  Accept
                </button>
              </div>
            ) : item.isAccepted == 'accepted' ? (
              <Link href={`/rooms/${item.roomId}`} target="_blank">
                Go to lesson room
              </Link>
            ) : (
              <button disabled>{item.isAccepted}</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
