import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
var VMT_list = []
class VMT {
    constructor(name) {
        this.name = name
        this.shader = "VertexlitGeneric"
        this.parameters = []
    }

    addParameter(paramName, paramValue){
        let param = new Object()
        param.name = paramName
        param.value = paramValue
        this.parameters.push(param)
    } 
    
    updateParameter(paramName, paramValue){
        this.parameters.forEach((e)=>{
            if(e.name == paramName) {
                e.value = paramValue
            }
        })
    } 
    toString() {
        let VMTStr = `${this.shader}\n`
        VMTStr += "{\n"
        this.parameters.forEach((param) => {
            let paramStr = `    $${param.name} "${param.value}"\n`
            VMTStr += paramStr
        });
        VMTStr += "}"
        return VMTStr
    }
}

async function load_gltf_file(file) {
    const gltf = await loader.loadAsync( file );
    var materials = []
    gltf.scene.traverse((obj) => {
        if (obj.isMesh && obj.material) {
            materials.push(obj.material)
        }
    })
    parse_materials(materials)
}

function parse_materials(materials){
    VMT_list = []
    for(var i = 0; i < materials.length; i++){
        let mat = materials[i]
        let vmt = new VMT(mat.name)
        vmt.addParameter("alphatest", mat._alphaTest)

        var base_tex_path = ""
        var normal_tex_path = ""
        
        base_tex_path = inp_override_path.value + mat.userData.vmat.TextureParams.g_tColor.replace(".vtex","").split("/").at(-1)
        normal_tex_path = inp_override_path.value + mat.userData.vmat.TextureParams.g_tNormal.replace(".vtex","").split("/").at(-1)
        
        vmt.addParameter("basetexture", base_tex_path)
        vmt.addParameter("bumpmap", normal_tex_path)
        
        vmt.addParameter("surfaceprop", "default")
        VMT_list.push(vmt)
    }
    console.log("loaded")
    loader_icon.className = "loader disabled"
    console.log(VMT_list)
    btn_download.disabled = false
}

window.onload = () => {
    btn_load.onclick = () => {
        console.log("loading")
        loader_icon.className = "loader"
        var file = file_picker.files[0]
        const fr = new FileReader()
        fr.onload = (e) => {
            load_gltf_file(fr.result)
        }
        fr.readAsDataURL(file)
    }
    btn_download.onclick = () => {
        var zip = new JSZip();
        VMT_list.forEach((e)=>{
            zip.file(`${inp_override_path.value}${e.name}.vmt`, e.toString());
        })
        zip.generateAsync({type:"blob"})
        .then(function(content) {
            saveAs(content, "VMTs.zip");
        });
    }
}