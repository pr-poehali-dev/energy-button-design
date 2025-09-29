'''
Business: Manage daily energy collection with server-side validation
Args: event - dict with httpMethod, body, queryStringParameters
      context - object with attributes: request_id, function_name
Returns: HTTP response dict with energy status
'''

import json
import os
from datetime import date
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'DELETE':
        headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
        user_id = event.get('headers', {}).get('x-user-id', 'default_user')
        
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute("DELETE FROM user_energy WHERE user_id = %s", (user_id,))
            conn.commit()
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'message': 'User data cleared'})
            }
        finally:
            cur.close()
            conn.close()
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    user_id = event.get('headers', {}).get('x-user-id', 'default_user')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            cur.execute(
                "SELECT energy, last_collection_date FROM user_energy WHERE user_id = %s",
                (user_id,)
            )
            result = cur.fetchone()
            
            if result:
                today = date.today()
                can_collect = result['last_collection_date'] != today if result['last_collection_date'] else True
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'energy': result['energy'],
                        'canCollect': can_collect,
                        'lastCollection': str(result['last_collection_date']) if result['last_collection_date'] else None
                    })
                }
            else:
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({
                        'energy': 0,
                        'canCollect': True,
                        'lastCollection': None
                    })
                }
        
        elif method == 'POST':
            today = date.today()
            
            cur.execute(
                "SELECT energy, last_collection_date FROM user_energy WHERE user_id = %s",
                (user_id,)
            )
            result = cur.fetchone()
            
            if result and result['last_collection_date'] == today:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({
                        'success': False,
                        'message': 'Energy already collected today'
                    })
                }
            
            if result:
                new_energy = result['energy'] + 3
                cur.execute(
                    "UPDATE user_energy SET energy = %s, last_collection_date = %s, updated_at = CURRENT_TIMESTAMP WHERE user_id = %s",
                    (new_energy, today, user_id)
                )
            else:
                new_energy = 3
                cur.execute(
                    "INSERT INTO user_energy (user_id, energy, last_collection_date) VALUES (%s, %s, %s)",
                    (user_id, new_energy, today)
                )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'success': True,
                    'energy': new_energy,
                    'message': 'Energy collected successfully'
                })
            }
        
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cur.close()
        conn.close()