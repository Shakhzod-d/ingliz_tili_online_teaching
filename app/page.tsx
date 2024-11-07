'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { v4 as uuidv4 } from 'uuid';
import { addDays } from 'date-fns';
import { db } from '../utils/firebase';
import { collection, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function TeacherList() {
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    // `teachers` kolleksiyasidagi o'zgarishlarni real-time kuzatish
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const teachers = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((teacher: any) => teacher.isActive && teacher.availableDays);
      setData(teachers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getAvailableDates = () => {
    if (!selectedTeacher) return [];
    const daysOfWeek = Object.keys(selectedTeacher.availableDays);
    return Array.from({ length: 30 }, (_, i) => addDays(new Date(), i)).filter((date) =>
      daysOfWeek.includes(date.toLocaleDateString('en-US', { weekday: 'long' })),
    );
  };

  const handleBuy = (teacher: any) => {
    setSelectedTeacher(teacher);
    setSelectedDate(null);
    setSelectedTime('');
    setComment('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('authToken='))
      ?.split('=')[1];

    if (!token) {
      router.push('/auth/sign-in');
      return;
    }

    if (!selectedDate || !selectedTime) {
      alert('Please select a day and time.');
      return;
    }

    const studentId = localStorage.getItem('studentId');
    if (!studentId) {
      alert('Student ID not found');
      return;
    }

    const lessonData = {
      studentId: studentId,
      day: selectedDate.toLocaleDateString('en-US', { weekday: 'long' }),
      time: selectedTime,
      status: 'new',
      comment,
      lessonStatus: 'not started',
      isAccepted: 'new',
      lessonId: selectedTeacher.lessons.length + 1,
      roomId: uuidv4(),
    };

    try {
      // Teacher kolleksiyasida `lessons` yangilash
      const teacherRef = doc(db, 'users', selectedTeacher.id);
      await updateDoc(teacherRef, {
        lessons: arrayUnion(lessonData),
      });

      // Student kolleksiyasida `orders` yangilash
      const studentRef = doc(db, 'users', studentId);
      await updateDoc(studentRef, {
        orders: arrayUnion({ ...lessonData, teacherId: selectedTeacher.id }),
      });

      alert('Lesson booked successfully');
      setShowModal(false);
    } catch (error) {
      console.error(error);
      alert('Error booking lesson');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  console.log(data);

  return (
    <div>
      <h1 className=" text-center">Welcome!</h1>
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
            Select Date:
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              includeDates={getAvailableDates()}
              placeholderText="Select a date"
            />
          </label>

          {selectedDate && (
            <label>
              Select Time:
              <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                <option value="">Select Time</option>
                {selectedTeacher.availableDays[
                  selectedDate.toLocaleDateString('en-US', { weekday: 'long' })
                ].map((time: { start: string; end: string }) => (
                  <option key={`${time.start}-${time.end}`} value={`${time.start} - ${time.end}`}>
                    {`${time.start} - ${time.end}`}
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
