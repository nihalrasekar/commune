from flask import Flask, session
from flask_socketio import SocketIO, emit
from flask import Flask, session
from flask_session import Session
from agent_logic import get_response

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev-key'
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

socketio = SocketIO(app, cors_allowed_origins="*", manage_session=False)

@socketio.on('connect')
def on_connect():
    session['history'] = []
    emit('connected', {'message': 'Connected to Real Estate AI'})

@socketio.on('user_message')
def on_user_message(data):
    question = data.get('message', '')
    history = session.get('history', [])
    
    response = get_response(question, history)
    history.append({'user': question, 'agent': response})
    session['history'] = history

    emit('agent_response', {'message': response})

@socketio.on('end_session')
def on_end_session():
    session.clear()
    emit('session_ended', {'message': 'Session ended.'})

@socketio.on('disconnect')
def on_disconnect():
    session.clear()

if __name__ == '__main__':
    socketio.run(app, debug=True,port=5000)
