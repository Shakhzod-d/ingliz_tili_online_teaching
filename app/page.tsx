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
import 'react-toastify/dist/ReactToastify.css'; // Toastify styles

export default function TeacherList() {
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false); // Track if it's a client-side render

  const router = useRouter();

  useEffect(() => {
    setIsClient(true); // This ensures that the code runs only on the client-side

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
  // import { toast } from 'react-toastify';
  // import { v4 as uuidv4 } from 'uuid';
  // import { db } from '../utils/firebase';
  // import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
  // import { useRouter } from 'next/navigation';

  // Cookie'dan authToken olish funksiyasi
  const getAuthToken = () => {
    return document.cookie
      .split('; ')
      .find((row) => row.startsWith('authToken='))
      ?.split('=')[1];
  };

  // LocalStorage'dan studentId olish funksiyasi
  const getStudentId = () => {
    return localStorage.getItem('studentId');
  };

  // O'qituvchiga notification yuborish funksiyasi
  const sendNotificationToTeacher = async (teacherFcmToken: any) => {
    const notificationPayload = {
      to: teacherFcmToken,
      notification: {
        title: 'New Lesson Order',
        body: 'You have a new lesson order from a student.',
      },
    };

    try {
      const response = await fetch(
        `https://fcm.googleapis.com/v1/projects/say-it-well/messages:send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'key=AIzaSyAzcNgIprjoeeSQ8GR777kCQwuIZA_qCuk',
          },
          body: JSON.stringify(notificationPayload),
        },
      );

      const data = await response.json();
      console.log('Notification sent successfully:', data);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const handleSubmit = async () => {
    // Auth tokenni olish
    const token = getAuthToken();
    if (!token) {
      router.push('/auth/sign-in');
      return;
    }

    // Sanani va vaqtni tanlashni tekshirish
    if (!selectedDate || !selectedTime) {
      alert('Please select a day and time.');
      return;
    }

    // Student ID'ni olish
    const studentId = getStudentId();
    if (!studentId) {
      alert('Student ID not found');
      return;
    }

    // Lesson data tayyorlash
    const lessonData = {
      studentId,
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
      // Teacher kolleksiyasida `lessons` va `notifications` yangilash
      const teacherRef = doc(db, 'users', selectedTeacher.id);
      await updateDoc(teacherRef, {
        lessons: arrayUnion(lessonData),
        notifications: arrayUnion({
          message: `New lesson order from student ID: ${studentId}`,
          timestamp: new Date().toISOString(),
        }),
      });

      // Student kolleksiyasida `orders` yangilash
      const studentRef = doc(db, 'users', studentId);
      await updateDoc(studentRef, {
        orders: arrayUnion({ ...lessonData, teacherId: selectedTeacher.id }),
      });

      // O'qituvchining FCM tokenini olish uchun `getDoc`dan foydalanamiz
      const teacherSnapshot = await getDoc(teacherRef);
      const teacherData = teacherSnapshot.data();
      if (teacherData?.fcmToken) {
        await sendNotificationToTeacher(teacherData.fcmToken);
      }

      // O'qituvchiga toast notification ko'rsatish
      toast.success(`Lesson booked with ${selectedTeacher.name}`);

      setShowModal(false);
    } catch (error) {
      console.error('Error booking lesson:', error);
      alert('Error booking lesson');
    }
  };

  if (!isClient) return null; // Do not render anything during SSR

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
      <ToastContainer /> {/* Toastify container */}
    </div>
  );
}
