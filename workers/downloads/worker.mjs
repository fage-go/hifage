import {DurableObject} from 'cloudflare:workers';
import worker, {ReleaseSnapshot as SnapshotLogic} from './index.mjs';

export class ReleaseSnapshot extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.logic = new SnapshotLogic(ctx, env);
  }
  fetch(request) {
    return this.logic.fetch(request);
  }
}

export default worker;
