'use client';

import axios from 'axios';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function TeacherList() {
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://48b745c40cead56f.mokky.dev/users');
        const teachers = response.data.filter(
          (item: { isActive: boolean; role: string }) => item.role === 'teacher' && item.isActive,
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
    if (!selectedDay || !selectedTime) {
      alert('Please select a day and time.');
      return;
    }

    const lessonData = {
      studentId: 2, // This should be dynamically retrieved
      day: selectedDay,
      time: selectedTime,
      status: 'new',
      comment,
      lessonStatus: 'not started',
      isAccepted: 'new',
      lessonId: selectedTeacher.lessons.length + 1, // Increment lessonId based on existing lessons
    };

    try {
      await axios.patch(`https://48b745c40cead56f.mokky.dev/users/${selectedTeacher.id}`, {
        lessons: [...selectedTeacher.lessons, lessonData],
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
      {data.map((item: any) => (
        <div key={item.id}>
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
