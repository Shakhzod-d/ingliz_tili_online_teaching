'use client';

import axios from 'axios';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const [data, setData] = useState<{
    availableDays?: any;
    id?: number;
    name?: string;
    description?: string;
    price?: string;
    rates?: string;
  }>({});

  const handleBuy = () => {};

  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      axios.get('https://48b745c40cead56f.mokky.dev/users/' + id).then((req) => setData(req.data));
    };
    fetchData();
  }, []);

  return (
    <div key={data.id}>
      <h2>Ismi: {data.name}</h2>
      <p>Description: {data.description || 'izoh yozilmagan'}</p>
      <p>Price: {data.price} $</p>
      <p>Rating: {data.rates}</p>
      <div>
        <p>Dars kunlari</p>
        <ol>
          {data?.availableDays &&
            Object.keys(data?.availableDays).map((day) => {
              return (
                <>
                  <li>{day}</li>
                  <ul>
                    {data.availableDays[day].map((item: string) => {
                      return <li>{item}</li>;
                    })}
                  </ul>
                </>
              );
            })}
        </ol>
      </div>
      <button onClick={handleBuy}>Buy</button>
    </div>
  );
}
