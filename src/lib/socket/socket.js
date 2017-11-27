import { wait } from '../utils';

const backend_url = 'ws://127.0.0.1';
const backend_port = '4444';
const url = `${backend_url}:${backend_port}`;

window.WebSocket = window.WebSocket || Object;

export default class Socket {
    constructor() {
        this.ws = new window.WebSocket(`${url}/establish`);

        this._handleMessage = this._handleMessage.bind(this);
    }

    connect() {
        const { disconnected, closing } = this.status;
        if (disconnected || closing) {
            this.ws = new window.WebSocket(`${url}/establish`);
        }
    }

    static get connection() {
        const sock = new Socket();
        sock.ws.onopen = (m) => console.log(m);
        sock.ws.onmessage = sock._handleMessage;
        return sock;
    }

    _handleMessage(messageEvent) {
        console.log(messageEvent);
        const message = JSON.parse(messageEvent.data);

        if (message.code && message.error) {
            return this._handleError(message);
        }

        if (!message.meta || !message.result) {
            console.error(message);
        }

        const event = new Event(message.meta.name);
        event.data = message.result;

        this.ws.dispatchEvent(event);
    }

    _handleError(error) {
        console.error(error);
    }

    on(name, { listener }) {
        this.ws.addEventListener(name, (evt) => {
            listener(evt.data);
        }, false);

        return {
            cancel: () => this.ws.removeEventListener(name, listener, false)
        }
    }

    async send(data) {
        let period = 0
        while (!this.connected) {
            await wait(.5);
            period += .5;
            if (period === 100) {
                console.error('did not send after 100 ms');
                return;
            }
        }
        this.ws.send(data);
    }

    get connected() {
        return this.ws.readyState === this.ws.OPEN;
    }

    get status() {
        const { readyState } = this.ws;
        return {
            connected: this.connected,
            disconnected: readyState === this.ws.CLOSED,
            connecting: readyState === this.ws.CONNECTING,
            closing: readyState === this.ws.CLOSING,
        }
    }
}