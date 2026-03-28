import EventEmitter from 'events'

class AsyncEventEmitter extends EventEmitter {

    async emitAsync(event, payload) {
        const listeners = this.listeners(event)

        for (const listener of listeners) {
            await listener(payload)
        }
    }
}

export const eventBus = new AsyncEventEmitter()