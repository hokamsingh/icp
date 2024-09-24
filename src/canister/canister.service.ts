import { Injectable } from '@nestjs/common';
import { HttpAgent, Actor, ActorSubclass } from '@dfinity/agent';
import { idlFactory } from './idl';
import fetch from 'node-fetch';

@Injectable()
export class CanisterService {
  private actor: ActorSubclass;

  constructor() {
    this.init();
  }

  async init() {
    try {
      (global as any).fetch = fetch;
      // Define your canister ID
      const canisterId = 'bkyz2-fmaaa-aaaaa-qaaaq-cai';

      // Use the updated HttpAgent.create() method
      const agent = await HttpAgent.create({
        host: 'http://127.0.0.1:4943', // The Internet Computer's host
      });

      // If you are in development, fetch the root key for certificate validation
      await agent.fetchRootKey(); // Do not use in production

      // Create an actor to interact with the canister
      this.actor = Actor.createActor(idlFactory, {
        agent,
        canisterId,
      });
    } catch (error) {
      console.log({ error });
    }
  }

  // Example method: Call a canister method
  async callCanisterMethod(): Promise<any> {
    try {
      const reg = await this.actor.register('Nest', 'NestPass');
      console.log({ result: JSON.stringify(reg) });
      const result = await this.actor.getUsers(); // Replace with your method
      console.log({ result: JSON.stringify(result) });
      return result;
    } catch (error) {
      throw new Error(`Canister call failed: ${error.message}`);
    }
  }
}
