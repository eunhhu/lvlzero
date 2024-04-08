import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

export const useWebGl = async (canvas:HTMLCanvasElement, global:IDB):Promise<{
    engine:BABYLON.Engine;
    gameUpdate:(tickData:IGameTickData, game:IGameInitData) => void;
    init:(game:IGameInitData) => void;
    clicker:(x:number, y:number, game:IGameInitData) => [number, number];
}> => {
    const engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer:true, stencil:true});

    async function createScene():Promise<BABYLON.Scene> {
        const scene = new BABYLON.Scene(engine)
        scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
        scene.ambientColor = new BABYLON.Color3(1, 1, 1);
        scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
        scene.fogDensity = 0.001;
        scene.fogColor = new BABYLON.Color3(1, 1, 1);
        scene.fogStart = 40;
        scene.fogEnd = 200;

        const camera = new BABYLON.ArcRotateCamera('Camera', 0, 0, 0, new BABYLON.Vector3(0, 0, 0), scene);
        camera.radius = 20;
        camera.lowerRadiusLimit = 5;
        camera.upperRadiusLimit = 20;
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvas, true);

        const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 2, 0), scene)
        light.intensity = 0.7
        light.diffuse = new BABYLON.Color3(1, 1, 1)

        const ground = BABYLON.MeshBuilder.CreateGround('ground', {width:1, height:1}, scene)
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

        return scene
    }

    let scene:BABYLON.Scene = await createScene();
    engine.runRenderLoop(() => {
        scene.render();
    });

    const gameUpdate = (tickData:IGameTickData, game:IGameInitData) => {
        tickData.units.forEach(async (unitData:IUnitData) => {
            const unit = scene.getMeshByName(`${unitData.id}`)
            if(unit){
                unit.position = new BABYLON.Vector3(unitData.x - game.size/2 + 0.5, 0.5, unitData.y - game.size/2 + 0.5)
            } else {
                const newUnit = (await BABYLON.SceneLoader.ImportMeshAsync('', 'assets/units/', `${unitData.type}.glb`, scene)).meshes[0]
                newUnit.id = `unit`
                newUnit.name = `${unitData.id}`
                newUnit.position = new BABYLON.Vector3(unitData.x - game.size/2 + 0.5, 0.5, unitData.y - game.size/2 + 0.5)
            }
        })

        tickData.enemies.forEach(async (enemyData:IEnemyData) => {
            const enemy = scene.getMeshByName(`${enemyData.id}`)
            if(enemy){
                enemy.position = new BABYLON.Vector3(enemyData.x - game.size/2 + 0.5, 0.5, enemyData.y - game.size/2 + 0.5)
            } else {
                const newEnemy = (await BABYLON.SceneLoader.ImportMeshAsync('', 'assets/enemies/', `${enemyData.type}.glb`, scene)).meshes[0]
                newEnemy.id = `enemy`
                newEnemy.name = `${enemyData.id}`
                newEnemy.position = new BABYLON.Vector3(enemyData.x - game.size/2 + 0.5, 0.5, enemyData.y - game.size/2 + 0.5)
            }
        })

        scene.getMeshesByID('unit').forEach((unit:BABYLON.AbstractMesh) => {
            if(!tickData.units.find((v:IUnitData) => `${v.id}` === unit.name)){
                unit.dispose()
            }
        })
        scene.getMeshesByID('enemy').forEach((enemy:BABYLON.AbstractMesh) => {
            if(!tickData.enemies.find((v:IEnemyData) => `${v.id}` === enemy.name)){
                enemy.dispose()
            }
        })
    }

    const init = (game:IGameInitData) => {
        (scene.getMeshById('ground') as BABYLON.Mesh).scaling = new BABYLON.Vector3(game.size, 1, game.size);

        const matName = 'GroundDirtWeedsPatchy004'
        const pathMat = new BABYLON.StandardMaterial(`M_${matName}`, scene)
        pathMat.ambientTexture = new BABYLON.Texture(`assets/textures/${matName}/${matName}_AO_1K.jpg`, scene)
        pathMat.bumpTexture = new BABYLON.Texture(`assets/textures/${matName}/${matName}_NRM_1K.jpg`, scene)
        pathMat.diffuseTexture = new BABYLON.Texture(`assets/textures/${matName}/${matName}_COL_1K.jpg`, scene)
        pathMat.specularTexture = new BABYLON.Texture(`assets/textures/${matName}/${matName}_GLOSS_1K.jpg`, scene)
        pathMat.reflectionTexture = new BABYLON.Texture(`assets/textures/${matName}/${matName}_REFL_1K.jpg`, scene)

        game.path.forEach((pathData:[number, number]) => {
            const path = BABYLON.MeshBuilder.CreateBox('path', {size:1}, scene)
            path.position = new BABYLON.Vector3(pathData[0] - game.size/2 + 0.5, 0.05, pathData[1] - game.size/2 + 0.5)
            path.scaling = new BABYLON.Vector3(1, 0.01, 1)
            path.material = pathMat
            scene.getMeshByID('ground')?.addChild(path)
        })
    }

    const clicker =  (x:number, y:number, game:IGameInitData):[number, number] => {
        const pickResult = scene.pick(x, y)
        if(!pickResult.hit) return [-1, -1]
        if(pickResult.pickedPoint?.x && pickResult.pickedPoint?.z){
            let posX = Math.floor(pickResult.pickedPoint?.x) + game.size/2
            let posZ = Math.floor(pickResult.pickedPoint?.z) + game.size/2
            if(game.path.find((v:[number, number]) => v[0] === posX && v[1] === posZ)) return [-1, -1]
            if(posX > game.size || posX < 0) return [-1, -1]
            if(posZ > game.size || posZ < 0) return [-1, -1]
            return [posX, posZ]
        } else return [-1, -1]
    }

    return {engine, gameUpdate, init, clicker}
}