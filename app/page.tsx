'use client';

import BookOrderModal from '@/components/shared/book-order-modal';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function TeacherList() {
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://48b745c40cead56f.mokky.dev/users');
        const teachers = response.data.filter(
          (item: { availableDays: boolean; isActive: boolean; role: string }) =>
            item.role === 'teacher' && item.isActive && item.availableDays,
        );
        setData(teachers);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  const handleBuy = (teacher: any) => {
    setSelectedTeacher(teacher);
    setSelectedDay('');
    setSelectedTime('');
    setComment('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('authToken='))
      ?.split('=')[1];

    // Agar token mavjud bo'lmasa, foydalanuvchini sign-in sahifasiga yo'naltirish
    if (!token) {
      router.push('/auth/sign-in');
      return;
    }

    if (!selectedDay || !selectedTime) {
      alert('Please select a day and time.');
      return;
    }

    // LocalStorage dan studentId ni oling
    const studentId = localStorage.getItem('studentId');
    if (!studentId) {
      alert('Student ID not found');
      return;
    }

    const lessonData = {
      studentId: parseInt(studentId, 10), // studentId ni raqamga aylantirish
      day: selectedDay,
      time: selectedTime,
      status: 'new',
      comment,
      lessonStatus: 'not started',
      isAccepted: 'new',
      lessonId: selectedTeacher.lessons.length + 1,
      roomId: uuidv4(),
    };

    try {
      // O'qituvchi uchun yangi darsni qo'shish
      await axios.patch(`https://48b745c40cead56f.mokky.dev/users/${selectedTeacher.id}`, {
        lessons: [...selectedTeacher.lessons, lessonData],
      });

      // Talaba uchun yangi darsni qo'shish
      await axios.patch(`https://48b745c40cead56f.mokky.dev/users/${studentId}`, {
        orders: [
          ...(data.find((user: { id: number }) => user.id === parseInt(studentId, 10))?.lessons ||
            []),
          { ...lessonData, studentId: selectedTeacher.id },
        ],
      });

      alert('Lesson booked successfully');
      setShowModal(false);
    } catch (error) {
      console.error(error);
      alert('Error booking lesson');
    }
  };

  return (
    <div>
      <div>
        <h1 style={{ textAlign: 'center' }}> Welcome!</h1>
      </div>
      <div className="cards">
        {data.map((item: any) => (
          <div key={item.id} className="card">
            <h2>{item.name}</h2>
            <p>{item.description}</p>
            <p>Price: {item.price}</p>
            <p>Rate: {item.rates}</p>
            <button onClick={() => handleBuy(item)}>Buy</button>
            <Link href={`/teacher/${item.id}`}>
              <button>More</button>
            </Link>
          </div>
        ))}
      </div>

      {showModal && selectedTeacher && (
        <div className="modal">
          <h3>Book a Lesson with {selectedTeacher.name}</h3>
          <label>
            Select Day:
            <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
              <option value="">Select Day</option>
              {Object.keys(selectedTeacher.availableDays).map((day) =>
                day.length ? (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ) : (
                  ''
                ),
              )}
            </select>
          </label>

          {selectedDay && (
            <label>
              Select Time:
              <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                <option value="">Select Time</option>
                {selectedTeacher.availableDays[selectedDay].map((time: string) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label>
            Comment:
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment here"
            />
          </label>

          <button onClick={handleSubmit}>Submit</button>
          <button onClick={() => setShowModal(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
