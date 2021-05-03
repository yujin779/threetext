import CANNON from "cannon";

export class CannonPhysics {
  constructor(gravity) {
    this.world = new CANNON.World();
    this.world.gravity.set(0, gravity, 0);
    this.world.broadphase = new CANNON.NaiveBroadphase(); //ぶつかっている可能性のあるオブジェクト同士を見つける
    this.world.solver.iterations = 8; //反復計算回数
    this.world.solver.tolerance = 0.1; //許容値
  }
}
