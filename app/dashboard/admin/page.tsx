'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../../utils/firebase'; // Firebase konfiguratsiya shu yo'lda

export default function ManageApiKey() {
  const [apiKey, setApiKey] = useState('');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState<any>('');
  const [status, setStatus] = useState<any>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentDocId, setCurrentDocId] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<any>([]);
  const [selectedApiKey, setSelectedApiKey] = useState('');
  console.log(selectedApiKey);

  // Firestore'dan barcha api_key'larni olish
  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const apiKeysCollection = collection(db, 'api_keys');
        const snapshot = await getDocs(apiKeysCollection);
        const keys = snapshot.docs.map((doc) => ({
          id: doc.id,
          key: doc.data().key,
        }));
        setApiKeys(keys);
      } catch (error) {
        console.error('Error fetching API keys:', error);
      }
    };

    fetchApiKeys();
  }, []);

  const handleSearchApiKey = async () => {
    if (!apiKey) {
      setStatus('Enter API Key to search!');
      return;
    }

    try {
      const apiKeysCollection = collection(db, 'api_keys');
      const q = query(apiKeysCollection, where('key', '==', apiKey));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0];
        const data = docRef.data();

        setIsUpdating(true); // Yangilash rejimiga o‘tish
        setCurrentDocId(docRef.id); // Hujjat ID sini saqlash
        setA(data.a || '');
        setB(data.b || '');
        setC(data.c || '');
        setStatus('API Key found! You can now update it.');
      } else {
        setIsUpdating(false); // Qo'shish rejimiga qaytish
        setCurrentDocId(null);
        setA('');
        setB('');
        setC('');
        setStatus('API Key not found. You can add it as a new key.');
      }
    } catch (error) {
      console.error('Error searching API Key:', error);
      setStatus('Failed to search API Key.');
    }
  };

  const handleAddOrUpdateApiKey = async () => {
    if (!apiKey || !a || !b || !c) {
      setStatus('All fields (API Key, A, B, C) must be filled!');
      return;
    }

    try {
      const apiKeysCollection = collection(db, 'api_keys');

      if (isUpdating && currentDocId) {
        // Mavjud hujjatni yangilash
        const docRef = doc(apiKeysCollection, currentDocId);
        await updateDoc(docRef, { key: apiKey, a, b, c, updatedAt: new Date() });
        setStatus('API Key successfully updated!');
      } else {
        // Yangi hujjat qo'shish
        await addDoc(apiKeysCollection, { key: apiKey, a, b, c, createdAt: new Date() });
        setStatus('API Key successfully added!');
      }

      // Holatlarni tozalash
      setApiKey('');
      setA('');
      setB('');
      setC('');
      setIsUpdating(false);
      setCurrentDocId(null);
    } catch (error) {
      console.error('Error managing API Key:', error);
      setStatus('Failed to manage API Key.');
    }
  };

  const handleSubmit = async (e: any) => {
    const selectedId = e.target.value; // Tanlangan hujjat ID sini olamiz
    setSelectedApiKey(selectedId); // Tanlangan qiymatni holatga o'rnatamiz

    try {
      if (selectedId) {
        // Tanlangan API Key ma'lumotlarini olish
        const apiKeysCollection = collection(db, 'api_keys');
        const docRef = doc(apiKeysCollection, selectedId); // Hujjat reference
        const docSnapshot = await getDoc(docRef); // Hujjatni o'qiymiz

        if (docSnapshot.exists()) {
          const data = docSnapshot.data();

          // `current` kolleksiyasini yangilash
          const currentCollection = collection(db, 'current');

          // Eski current hujjatni o'chirish
          const currentSnapshot = await getDocs(currentCollection);
          currentSnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
          });

          // Yangi current hujjat qo'shish
          await addDoc(currentCollection, {
            key: data.key,
            a: data.a,
            b: data.b,
            c: data.c,
            updatedAt: new Date(),
          });

          setStatus('Current API Key updated successfully!');
        } else {
          setStatus('Selected API Key does not exist.');
        }
      } else {
        setStatus('Please select an API Key.');
      }
    } catch (error) {
      console.error('Error updating current API Key:', error);
      setStatus('Failed to update current API Key.');
    }
  };

  return (
    <div className="container">
      <h1>{isUpdating ? 'Update API Key' : 'Push API Key'}</h1>
      <input
        type="text"
        placeholder="Enter API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        className="input"
      />
      <button onClick={handleSearchApiKey} className="button">
        Search API Key
      </button>

      {/* Qo'shimcha maydonlar */}
      {
        <>
          <input
            type="text"
            placeholder="Enter A"
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="input"
          />
          <input
            type="text"
            placeholder="Enter B"
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="input"
          />
          <input
            type="text"
            placeholder="Enter C"
            value={c}
            onChange={(e) => setC(e.target.value)}
            className="input"
          />
        </>
      }

      <button onClick={handleAddOrUpdateApiKey} className="button">
        {isUpdating ? 'Update API Key' : 'Push API Key'}
      </button>

      {/* Select Option */}
      <div className="select-container">
        <label htmlFor="current">Select Current API Key:</label>
        <select id="current" value={selectedApiKey} onChange={handleSubmit}>
          <option value="">Select an API Key</option>
          {apiKeys.map((key: any) => (
            <option key={key.id} value={key.id}>
              {key.key}
            </option>
          ))}
        </select>
      </div>

      {status && <p>{status}</p>}
    </div>
  );
}
