import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';
import finalData from '@/Final-Data.json';

export async function POST(request: NextRequest) {
  try {
    // Add basic authentication/authorization here
    const { authorization } = await request.json();
    
    // Simple auth check - ganti dengan auth yang lebih secure
    if (authorization !== 'your-secret-key') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting tier update process...');
    
    const batch = writeBatch(db);
    let updateCount = 0;
    const results = [];

    for (const user of finalData) {
      const { GSAID, Name, University, Tier } = user;
      
      try {
        // Query user by GSAID
        const userQuery = query(
          collection(db, 'users'),
          where('gsaid', '==', GSAID)
        );
        
        const userSnapshot = await getDocs(userQuery);
        
        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const currentData = userDoc.data();
          
          // Check if tier needs update
          if (currentData.tier !== Tier) {
            console.log(`Updating ${Name} (${GSAID}): ${currentData.tier} -> ${Tier}`);
            
            batch.update(userDoc.ref, {
              tier: Tier,
              university: University,
              updatedAt: serverTimestamp()
            });
            
            updateCount++;
            results.push({
              gsaid: GSAID,
              name: Name,
              oldTier: currentData.tier,
              newTier: Tier,
              status: 'updated'
            });
          } else {
            results.push({
              gsaid: GSAID,
              name: Name,
              tier: Tier,
              status: 'no_change'
            });
          }
        } else {
          results.push({
            gsaid: GSAID,
            name: Name,
            status: 'not_found'
          });
        }
      } catch (error) {
        console.error(`Error processing ${GSAID}:`, error);
        results.push({
          gsaid: GSAID,
          name: Name,
          status: 'error',
          error: error.message
        });
      }
    }
    
    if (updateCount > 0) {
      await batch.commit();
      console.log(`Successfully updated ${updateCount} users`);
    }
    
    return NextResponse.json({
      success: true,
      message: `Update completed. ${updateCount} users updated.`,
      totalProcessed: finalData.length,
      updateCount,
      results
    });
    
  } catch (error) {
    console.error('Error in update process:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}