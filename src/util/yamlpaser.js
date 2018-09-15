const YAML = require('yamljs');
const fs = require("fs");

function YAMLPaser() {
    var filePath;
    var data;

    this.parse(file) {
        filePath = file
        if (filePath) {
            //load YAML
            data = YAML.parse(fs.readFileSync(filePath).toString());
        }
    }

    this.getJobs() {
        if (data && data.jobs) {
            return data.jobs;
        }
        return null;
    }

    this.getResources() {
        if (data && data.resources) {
            //改成字典提高检索效率
            return data.resources;
        }
        return null;
    }


}
module.exports = YAMLPaser;