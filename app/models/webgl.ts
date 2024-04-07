import * as BABYLON from 'babylonjs';
import { EventEmitter } from './eventEmitter';

export const useWebGl = (canvas:HTMLCanvasElement, global:IDB):{
    engine:BABYLON.Engine;
    glOn:(event:string, listener:(...args:any[]) => void) => void;
    glOff:(event:string, listener:(...args:any[]) => void) => void;
    glEmit:(event:string, ...args:any[]) => void;
} => {
    const events = new EventEmitter()
    const engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer:true, stencil:true});

    let unitMeshes:BABYLON.AbstractMesh[][] = []
    let enemyMeshes:BABYLON.AbstractMesh[][] = []
    let projectileMeshes:BABYLON.AbstractMesh[][] = []

    async function createScene():Promise<BABYLON.Scene> {
        const scene = new BABYLON.Scene(engine)
        scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
        scene.ambientColor = new BABYLON.Color3(1, 1, 1);
        scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
        scene.fogDensity = 0.01;
        scene.fogColor = new BABYLON.Color3(1, 1, 1);
        scene.fogStart = 0;
        scene.fogEnd = 100;

        const camera = new BABYLON.ArcRotateCamera('Camera', 0, 0, 0, new BABYLON.Vector3(0, 0, 0), scene);
        camera.radius = 20;
        camera.lowerRadiusLimit = 5;
        camera.upperRadiusLimit = 20;
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvas, true);

        const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene)
        light.intensity = 0.7
        light.diffuse = new BABYLON.Color3(1, 1, 1)

        const ground = BABYLON.MeshBuilder.CreateGround('ground', {width:10, height:10}, scene)
        const matName = 'GroundGrassGreen002'
        const groundMaterial = new BABYLON.StandardMaterial(`M_${matName}`, scene)
        groundMaterial.ambientTexture = new BABYLON.Texture(`assets/textures/${matName}/${matName}_AO_1K.jpg`, scene)
        groundMaterial.bumpTexture = new BABYLON.Texture(`assets/textures/${matName}/${matName}_NRM_1K.jpg`, scene)
        groundMaterial.diffuseTexture = new BABYLON.Texture(`assets/textures/${matName}/${matName}_COL_1K.jpg`, scene)
        groundMaterial.specularTexture = new BABYLON.Texture(`assets/textures/${matName}/${matName}_GLOSS_1K.jpg`, scene)
        groundMaterial.reflectionTexture = new BABYLON.Texture(`assets/textures/${matName}/${matName}_REFL_1K.jpg`, scene)
        ground.material = groundMaterial

        const skybox = BABYLON.MeshBuilder.CreateBox('skybox', {size:500}, scene)
        const skyboxMaterial = new BABYLON.StandardMaterial('skybox', scene)
        skyboxMaterial.backFaceCulling = false
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture('assets/textures/skybox', scene)
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0)
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0)
        skybox.material = skyboxMaterial
        skybox.infiniteDistance = true

        await Promise.all(global.units.map(async (unit:IUnit) => {
            const unitMesh = await BABYLON.SceneLoader.ImportMeshAsync('', 'assets/units/', `${unit.type}.glb`, scene)
            unitMeshes.push(unitMesh.meshes)
        }))

        await Promise.all(global.enemies.map(async (enemy:IEnemy) => {
            const enemyMesh = await BABYLON.SceneLoader.ImportMeshAsync('', 'assets/enemies/', `${enemy.type}.glb`, scene)
            enemyMeshes.push(enemyMesh.meshes)
        }))

        return scene
    }
    let scene:BABYLON.Scene;
    createScene().then((_s) => scene = _s);
    engine.runRenderLoop(() => {
        scene.render();
    });
    const glOn = (event:string, listener:(...args:any[]) => void) => {events.on(event, listener)};
    const glOff = (event:string, listener:(...args:any[]) => void) => {events.off(event, listener)};
    const glEmit = (event:string, ...args:any[]) => {events.emit(event, args)};
    glEmit('ready')
    
    let unitDatas:IUnitData[] = []
    let enemyDatas:IEnemyData[] = []
    let projectileDats:IProjectileData[] = []

    glOn('gameUpdate', (tickData:IGameTickData) => {
        unitDatas = tickData.units
        enemyDatas = tickData.enemies
        projectileDats = tickData.projectiles

        unitDatas.forEach((unitData:IUnitData) => {
            const unit = scene.getMeshById(`${unitData.id}`)
            if(unit){
                unit.position = new BABYLON.Vector3(unitData.x, 1, unitData.y)
            }
        })

        enemyDatas.forEach((enemyData:IEnemyData) => {
            const enemy = scene.getMeshById(`${enemyData.id}`)
            if(enemy){
                enemy.position = new BABYLON.Vector3(enemyData.x, 1, enemyData.y)
            }
        })
    })

    glOn('init', (game:IGameInitData) => {
        (scene.getMeshById('ground') as BABYLON.Mesh).scaling = new BABYLON.Vector3(game.size, 1, game.size);
    })

    glOn('click', (x:number, y:number) => {
        const pickResult = scene.pick(x, y)
        if(pickResult.hit){
            glEmit('click', pickResult.pickedPoint)
        }
    })
    return {engine, glOn, glOff, glEmit}
}