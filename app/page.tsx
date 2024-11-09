'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { v4 as uuidv4 } from 'uuid';
import { addDays } from 'date-fns';
import { db } from '../utils/firebase';
import { collection, onSnapshot, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
// import router from '';

export default function TeacherList() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
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

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return document.cookie
        .split('; ')
        .find((row) => row.startsWith('authToken='))
        ?.split('=')[1];
    }
  };

  const getStudentId = () => {
    return localStorage.getItem('studentId');
  };

  const sendNotificationToTeacher = async (teacherFcmToken: any) => {
    const notificationPayload = {
      message: {
        token: teacherFcmToken,
        notification: {
          title: 'New Lesson Order',
          body: 'You have a new lesson order from a student.',
        },
      },
    };

    try {
      const response = await fetch('/api/sendNotification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationPayload),
      });
      if (!response.ok) {
        throw new Error('Failed to send notification');
      }
      console.log('Notification sent successfully');
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const handleSubmit = async () => {
    const token = getAuthToken();
    if (!token) {
      router.push('/auth/sign-in');
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error('Please select a day and time.');
      return;
    }

    const studentId = getStudentId();
    if (!studentId) {
      toast.error('Student ID not found');
      return;
    }

    const lessonData = {
      studentId,
      day: selectedDate.toLocaleDateString('en-US', { weekday: 'long' }),
      time: selectedTime,
      status: 'new',
      comment,
      lessonStatus: 'not started',
      isAccepted: 'new',
      lessonId: selectedTeacher?.lessons?.length ? selectedTeacher.lessons.length + 1 : 1,
      roomId: uuidv4(),
    };

    try {
      const teacherRef = doc(db, 'users', selectedTeacher.id);
      await updateDoc(teacherRef, {
        lessons: arrayUnion(lessonData),
        notifications: arrayUnion({
          message: `New lesson order from student ID: ${studentId}`,
          timestamp: new Date().toISOString(),
        }),
      });

      const studentRef = doc(db, 'users', studentId);
      await updateDoc(studentRef, {
        orders: arrayUnion({ ...lessonData, teacherId: selectedTeacher.id }),
      });

      const teacherSnapshot = await getDoc(teacherRef);
      const teacherData = teacherSnapshot.data();
      if (teacherData?.fcmToken) {
        await sendNotificationToTeacher(teacherData.fcmToken);
      }

      toast.success(`Lesson booked with ${selectedTeacher.name}`);
      setShowModal(false);
    } catch (error) {
      console.error('Error booking lesson:', error);
      toast.error('Error booking lesson');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-center">Welcome!</h1>
      <div className="cards">
        {data.map((item) => (
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
                ].map((time: { start: any; end: any }) => (
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
