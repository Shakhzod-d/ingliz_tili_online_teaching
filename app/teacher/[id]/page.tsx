'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../utils/firebase';

export default function Page() {
  const [data, setData] = useState<{
    availableDays: { [key: string]: { start: string; end: string }[] };
    id?: number;
    name?: string;
    description?: string;
    price?: string;
    rates?: string;
  }>({ availableDays: {} });

  const { id } = useParams();

  useEffect(() => {
    if (typeof id === 'string') {
      const docRef = doc(db, 'users', id);

      // Real vaqt kuzatuv funksiyasi
      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          setData(snapshot.data() as typeof data);
        }
      });

      // Tozlash funksiyasi
      return () => unsubscribe();
    }
  }, [id]);

  return (
    <div key={data.id}>
      <h2>Ismi: {data.name}</h2>
      <p>Description: {data.description || 'Izoh yozilmagan'}</p>
      <p>Price: {data.price} $</p>
      <p>Rating: {data.rates}</p>
      <div>
        <p>Dars kunlari:</p>
        <ol>
          {data?.availableDays &&
            Object.keys(data.availableDays).map((day) => (
              <li key={day}>
                {day}
                <ul>
                  {data?.availableDays[day].map((item, index) => (
                    <li key={index}>
                      {item.start} - {item.end}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
        </ol>
      </div>
      <button onClick={() => console.log(data)}>Buy</button>
    </div>
  );
}

// Firebase ichidagi ma'lumotlarni olish uchun handleBuy funksiyasini to'ldirish kerak.
