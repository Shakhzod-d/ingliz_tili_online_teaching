'use client';

import axios from 'axios';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Key, ReactNode, useEffect, useState } from 'react';

export default function () {
  const { id } = useParams();

  const [data, setData] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await axios
          .get('https://48b745c40cead56f.mokky.dev/users/' + id)
          .then((req) => setData(req.data));
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  console.log(data);

  return (
    <div>
      <h1>student dashboard</h1>

      <p>
        Your name: <b>{data.name}</b>
      </p>

      <div className="cards">
        {data.orders?.map(
          (item: { isAccepted: string; roomId: ReactNode; lessonId: Key | null | undefined }) => (
            <div key={item.lessonId} className="card">
              <p>
                Order ID: <b>{item.roomId}</b>
              </p>
              {item.isAccepted == 'accepted' ? (
                <Link href={`/rooms/${item.roomId}`} target="_blank">
                  Go to lesson room
                </Link>
              ) : item.isAccepted == 'canceled' ? (
                <p>order rad etildi!</p>
              ) : (
                <p>Order xali accept qilinmadi</p>
              )}
            </div>
          ),
        )}
      </div>
    </div>
  );
}
