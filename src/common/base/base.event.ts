export class BaseEvent {
  static eventName: string;

  constructor(eventName: string) {
    BaseEvent.eventName = eventName;
  }
}
