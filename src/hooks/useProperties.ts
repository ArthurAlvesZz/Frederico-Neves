import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PROPERTIES as FALLBACK_PROPERTIES } from '../constants';
import { Property } from '../types';

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch listed properties for regular site visitors
    // For admins to see all, we shouldn't use this hook in the dashboard
    const q = query(
      collection(db, 'properties'),
      where('isUnlisted', '==', false),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty && properties.length === 0) {
        // If the database is completely empty (not seeded yet), fallback to hardcoded
        // Note: this means if they delete everything it might show hardcoded again,
        // but it's safe for initial start.
        setProperties(FALLBACK_PROPERTIES as any);
      } else {
        const props: Property[] = [];
        snapshot.forEach(doc => {
          props.push({ id: doc.id, ...doc.data() } as Property);
        });
        setProperties(props);
      }
      setLoading(false);
    }, (error) => {
      if (properties.length === 0) {
         setProperties(FALLBACK_PROPERTIES as any);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { properties, loading };
}

// Function to fetch a single property bypassing the "isUnlisted" constraint for direct links.
export async function fetchPropertyById(id: string): Promise<Property | null> {
    try {
       // First check current properties array from Firestore
       const docRef = doc(db, 'properties', id);
       const docSnap = await getDoc(docRef);
       if (docSnap.exists()) {
           return { id: docSnap.id, ...docSnap.data() } as Property;
       }
       // Fallback to constants
       const fallback = FALLBACK_PROPERTIES.find(p => p.id === id);
       if (fallback) return fallback as any;
       
       return null;
    } catch (e) {
       // Fallback
       const fallback = FALLBACK_PROPERTIES.find(p => p.id === id);
       return (fallback as any) || null;
    }
}
