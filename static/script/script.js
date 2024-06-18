var valueSelected = "Terraform 1"

var question = ""


messages = [
    {
        'sender' : 'AI',
        'message' : 'hello'
    },
    {
        'sender' : 'User',
        'message' : 'Hi there'
    }
]
document.addEventListener("DOMContentLoaded",  
function () { 

    document.querySelector('#terraform_option').innerText = valueSelected;
    const input = document.getElementById("questionBox");

    const architecture_1 = document.querySelector('#architecture_1');
    const architecture_2 = document.querySelector('#architecture_2');
    const architecture_3 = document.querySelector('#architecture_3');
    const architecture_4 = document.querySelector('#architecture_4');
    architecture_1.style.width = '80%';
    architecture_2.style.height = 0;
    architecture_3.style.height = 0;
    architecture_4.style.height = 0;

    const terraform_code = document.querySelector('#terraform_code');
    terraform_code.innerHTML=terraform_code_1

    input.addEventListener("keyup", function (e) {
        if (e.code === "Enter") {  //checks whether the pressed key is "Enter"
            submitQuestion()
        }else{
            question = e.target.value;
        }
    });


}); 

function updateChat(newMessage,sender){
    const listOfMessage = document.getElementById("messages");
    console.log(listOfMessage);

    var li = document.createElement("li");
    li.classList.add('eachMessage')
    if(sender ==='user'){
        li.classList.add('userMessage')
    }else{
        li.classList.add('aiMessage')
    }
    li.appendChild(document.createTextNode(newMessage));
    listOfMessage.appendChild(li);

    var elem = document.getElementById('messages');
    elem.scrollTop = elem.scrollHeight;
    

}


function changeOption(value) {
    valueSelected = value
    console.log("It's here")
    console.log(valueSelected)
    document.querySelector('#terraform_option').innerText = valueSelected;

    const architecture_1 = document.querySelector('#architecture_1');
    const architecture_2 = document.querySelector('#architecture_2');
    const architecture_3 = document.querySelector('#architecture_3');
    const architecture_4 = document.querySelector('#architecture_4');
    architecture_1.style.height = 0;
    architecture_2.style.height = 0;
    architecture_3.style.height = 0;
    architecture_4.style.height = 0;

    const terraform_code = document.querySelector('#terraform_code');
    if(valueSelected === "Terraform 1"){
        // architecture_1.style.visibility = "visible";
        architecture_1.style.height = '80%';
        terraform_code.innerHTML=terraform_code_1

    }else if(valueSelected === "Terraform 2"){
        // architecture_2.style.visibility = "visible";
        architecture_2.style.height = '80%';
        terraform_code.innerHTML=terraform_code_2

    }else if(valueSelected ==="Terraform 3"){
        // architecture_3.style.visibility = "visible";
        architecture_3.style.height = '80%';
        terraform_code.innerHTML=terraform_code_3
    }else{
      architecture_4.style.height = '80%';
      terraform_code.innerHTML=terraform_code_4
    }
}


async function submitQuestion() {
    console.log('Make post request')
    updateChat(question, "user")
   
    var input = document.getElementById("questionBox");
    


    try {
        const request = {
            terraform_example: valueSelected,
            prompt: question
        }
        const response = await axios.post(`/postchat`, request);
        console.log(response);
        const message_received = response.data["message"]["candidates"][0].text;
        updateChat(message_received,"ai");
        
        console.log(`Added a new Todo!`, response);

        question = ""
        input.value="";

      } catch (errors) {
        console.error(errors);
      }
   
}


const terraform_code_1 = `
/** <br>
 * Copyright 2022 Google LLC <br>
 * <br>
 * Licensed under the Apache License, Version 2.0 (the "License"); <br>
 * you may not use this file except in compliance with the License. <br>
 * You may obtain a copy of the License at <br>
 * <br>
 *      http://www.apache.org/licenses/LICENSE-2.0 <br>
 * <br>
 * Unless required by applicable law or agreed to in writing, software <br>
 * distributed under the License is distributed on an "AS IS" BASIS, <br>
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. <br>
 * See the License for the specific language governing permissions and <br>
 * limitations under the License. <br>
 */ <br>
 <br>
# [START storage_flask_google_cloud_quickstart_parent_tag] <br>
# [START compute_flask_quickstart_vpc] <br>
resource "google_compute_network" "vpc_network" { <br>
  name                    = "my-custom-mode-network" <br>
  auto_create_subnetworks = false <br>
  mtu                     = 1460 <br>
} <br>
<br>
resource "google_compute_subnetwork" "default" { <br>
  name          = "my-custom-subnet" <br>
  ip_cidr_range = "10.0.1.0/24" <br>
  region        = "us-west1" <br>
  network       = google_compute_network.vpc_network.id <br>
}
# [END compute_flask_quickstart_vpc] <br>

# [START compute_flask_quickstart_vm] <br>
# Create a single Compute Engine instance <br>
resource "google_compute_instance" "default" { <br>
  name         = "flask-vm" <br>
  machine_type = "f1-micro" <br>
  zone         = "us-west1-a" <br>
  tags         = ["ssh"] <br>

  boot_disk { <br>
    initialize_params { <br>
      image = "debian-cloud/debian-11" <br>
    } <br>
  } <br>
  <br>
  # Install Flask <br>
  metadata_startup_script = "sudo apt-get update; sudo apt-get install -yq build-essential python3-pip rsync; pip install flask" <br>
  <br>
  network_interface { <br>
    subnetwork = google_compute_subnetwork.default.id <br>
    <br>
    access_config { <br>
      # Include this section to give the VM an external IP address <br>
    } <br>
  } <br>
} <br>
# [END compute_flask_quickstart_vm] <br>
<br>
# [START vpc_flask_quickstart_ssh_fw] <br>
resource "google_compute_firewall" "ssh" { <br>
  name = "allow-ssh" <br>
  allow { <br>
    ports    = ["22"] <br>
    protocol = "tcp" <br>
  } <br>
  direction     = "INGRESS" <br>
  network       = google_compute_network.vpc_network.id <br>
  priority      = 1000 <br>
  source_ranges = ["0.0.0.0/0"] <br>
  target_tags   = ["ssh"] <br>
} <br>
# [END vpc_flask_quickstart_ssh_fw] <br>
<br>
<br>
# [START vpc_flask_quickstart_5000_fw] <br>
resource "google_compute_firewall" "flask" { <br>
  name    = "flask-app-firewall" <br>
  network = google_compute_network.vpc_network.id <br>
  <br>
  allow { <br>
    protocol = "tcp" <br>
    ports    = ["5000"] <br>
  } <br>
  source_ranges = ["0.0.0.0/0"] <br>
} <br>
# [END vpc_flask_quickstart_5000_fw] <br>
<br>
# Create new multi-region storage bucket in the US <br>
# with versioning enabled <br>
<br>
# [START storage_kms_encryption_tfstate] <br>
resource "google_kms_key_ring" "terraform_state" { <br>
  name     = "{random_id.bucket_prefix.hex}-bucket-tfstate" <br>
  location = "us" <br>
} <br>
<br>
resource "google_kms_crypto_key" "terraform_state_bucket" { <br>
  name            = "test-terraform-state-bucket" <br>
  key_ring        = google_kms_key_ring.terraform_state.id <br>
  rotation_period = "86400s" <br>
  <br>
  lifecycle { <br>
    prevent_destroy = false <br>
  } <br>
} <br>
<br>
# Enable the Cloud Storage service account to encrypt/decrypt Cloud KMS keys <br>
data "google_project" "project" { <br>
} <br>
<br>
resource "google_project_iam_member" "default" { <br>
  project = data.google_project.project.project_id <br>
  role    = "roles/cloudkms.cryptoKeyEncrypterDecrypter" <br>
  member  = "serviceAccount:service-{data.google_project.project.number}@gs-project-accounts.iam.gserviceaccount.com" <br>
} <br>
# [END storage_kms_encryption_tfstate] <br>

# [START storage_bucket_tf_with_versioning] <br>
resource "random_id" "bucket_prefix" { <br>
  byte_length = 8 <br>
} <br>
<br>
resource "google_storage_bucket" "default" { <br>
  name          = "{random_id.bucket_prefix.hex}-bucket-tfstate" <br>
  force_destroy = false <br>
  location      = "US" <br>
  storage_class = "STANDARD" <br>
  versioning { <br>
    enabled = true <br>
  } <br>
  encryption { <br>
    default_kms_key_name = google_kms_crypto_key.terraform_state_bucket.id <br>
  } <br>
  depends_on = [ <br>
    google_project_iam_member.default <br>
  ] <br>
} <br>
# [END storage_bucket_tf_with_versioning] <br>
# [END storage_flask_google_cloud_quickstart_parent_tag] <br>
`

const terraform_code_2 = `
/* <br>
Connect with friends via a shared digital space in Minecraft. <br>
<br>
This is a safe Minecraft server that won't break the bank. Game data is preserved across sessions. <br>
Server is hosted on a permenant IP address. You need to start the VM each session, but it <br>
will shutdown within 24 hours if you forget to turn it off. <br>
Process is run in a sandboxed VM, so any server exploits cannot do any serious damage. <br>
<br>
We are experimenting with providing support through a [google doc](https://docs.google.com/document/d/1TXyzHKqoKMS-jY9FSMrYNLEGathqSG8YuHdj0Z9GP34). <br>
Help us make this simple for others to use by asking for help. <br>
<br>

Features <br>
- Runs [itzg/minecraft-server](https://hub.docker.com/r/itzg/minecraft-server/) Docker image <br>
- Preemtible VM (cheapest), shuts down automatically within 24h if you forget to stop the VM <br>
- Reserves a stable public IP, so the minecraft clients do not need to be reconfigured <br>
- Reserves the disk, so game data is remembered across sessions <br>
- Restricted service account, VM has no ability to consume GCP resources beyond its instance and disk <br>
- 2$ per month <br>
  - Reserved IP address costs: $1.46 per month <br>
  - Reserved 10Gb disk costs: $0.40 <br>
  - VM cost: $0.01 per hour, max session cost $0.24 <br>
*/ <br>

# We require a project to be provided upfront <br>
# Create a project at https://cloud.google.com/ <br>
# Make note of the project ID <br>
# We need a storage bucket created upfront too to store the terraform state <br>
terraform { <br>
  backend "gcs" { <br>
    prefix = "minecraft/state" <br>
    bucket = "terraform-larkworthy" <br>
  } <br>
} <br>

# You need to fill these locals out with the project, region and zone <br>
# Then to boot it up, run:- <br>
#   gcloud auth application-default login <br>
#   terraform init <br>
#   terraform apply <br>
locals { <br>
  # The Google Cloud Project ID that will host and pay for your Minecraft server <br>
  project = "larkworthy-tester" <br>
  region  = "europe-west1" <br>
  zone    = "europe-west1-b" <br>
  # Allow members of an external Google group to turn on the server <br>
  # through the Cloud Console mobile app or https://console.cloud.google.com <br>
  # Create a group at https://groups.google.com/forum/#!creategroup <br>
  # and invite members by their email address. <br>
  enable_switch_access_group = 1 <br>
  minecraft_switch_access_group = "minecraft-switchers-lark@googlegroups.com" <br>
} <br>

<br>
provider "google" { <br>
  project = local.project <br>
  region  = local.region <br>
} <br>
<br>
# Create service account to run service with no permissions <br>
resource "google_service_account" "minecraft" { <br>
  account_id   = "minecraft" <br>
  display_name = "minecraft" <br>
} <br>
<br>
# Permenant Minecraft disk, stays around when VM is off <br>
resource "google_compute_disk" "minecraft" { <br>
  name  = "minecraft" <br>
  type  = "pd-standard" <br>
  zone  = local.zone <br>
  image = "cos-cloud/cos-stable" <br>
} <br>
<br>
# Permenant IP address, stays around when VM is off <br>
resource "google_compute_address" "minecraft" { <br>
  name   = "minecraft-ip" <br>
  region = local.region <br>
} <br>
<br>
# VM to run Minecraft, we use preemptable which will shutdown within 24 hours <br>
resource "google_compute_instance" "minecraft" { <br>
  name         = "minecraft" <br>
  machine_type = "n1-standard-1" <br>
  zone         = local.zone <br>
  tags         = ["minecraft"] <br>
  <br>
  # Run itzg/minecraft-server docker image on startup <br>
  # The instructions of https://hub.docker.com/r/itzg/minecraft-server/ are applicable <br>
  # For instance, Ssh into the instance and you can run <br>
  #  docker logs mc <br>
  #  docker exec -i mc rcon-cli <br>
  # Once in rcon-cli you can "op <player_id>" to make someone an operator (admin) <br>
  # Use 'sudo journalctl -u google-startup-scripts.service' to retrieve the startup script output <br>
  metadata_startup_script = "docker run -d -p 25565:25565 -e EULA=TRUE -e VERSION=1.12.2 -v /var/minecraft:/data --name mc -e TYPE=FORGE -e FORGEVERSION=14.23.0.2552 -e MEMORY=2G --rm=true itzg/minecraft-server:latest;" <br>
  <br>
  metadata = { <br>
    enable-oslogin = "TRUE" <br>
  } <br>
  <br>
  boot_disk { <br>
    auto_delete = false # Keep disk after shutdown (game data) <br>
    source      = google_compute_disk.minecraft.self_link <br>
  } <br>
  <br>
  network_interface { <br>
    network = google_compute_network.minecraft.name <br>
    access_config { <br>
      nat_ip = google_compute_address.minecraft.address <br>
    } <br>
  } <br>
  <br>
  service_account { <br>
    email  = google_service_account.minecraft.email <br>
    scopes = ["userinfo-email"] <br>
  } <br>
  <br>
  scheduling { <br>
    preemptible       = true # Closes within 24 hours (sometimes sooner) <br>
    automatic_restart = false <br>
  } <br>
} <br>
<br>
# Create a private network so the minecraft instance cannot access <br>
# any other resources. <br>
resource "google_compute_network" "minecraft" { <br>
  name = "minecraft" <br>
} <br>
<br>
# Open the firewall for Minecraft traffic <br>
resource "google_compute_firewall" "minecraft" { <br>
  name    = "minecraft" <br>
  network = google_compute_network.minecraft.name <br>
  # Minecraft client port <br>
  allow { <br>
    protocol = "tcp" <br>
    ports    = ["25565"] <br>
  } <br>
  # ICMP (ping) <br>
  allow { <br>
    protocol = "icmp" <br>
  } <br>
  # SSH (for RCON-CLI access) <br>
  allow { <br>
    protocol = "tcp" <br>
    ports    = ["22"] <br>
  } <br>
  source_ranges = ["0.0.0.0/0"] <br>
  target_tags   = ["minecraft"] <br>
} <br>
<br>
resource "google_project_iam_custom_role" "minecraftSwitcher" { <br>
  role_id     = "MinecraftSwitcher" <br>
  title       = "Minecraft Switcher" <br>
  description = "Can turn a VM on and off" <br>
  permissions = ["compute.instances.start", "compute.instances.stop", "compute.instances.get"] <br>
} <br>
<br>
resource "google_project_iam_custom_role" "instanceLister" { <br>
  role_id     = "InstanceLister" <br>
  title       = "Instance Lister" <br>
  description = "Can list VMs in project" <br>
  permissions = ["compute.instances.list"] <br>
} <br>

resource "google_compute_instance_iam_member" "switcher" { <br>
  count = local.enable_switch_access_group <br>
  project = local.project <br>
  zone = local.zone <br>
  instance_name = google_compute_instance.minecraft.name <br>
  role = google_project_iam_custom_role.minecraftSwitcher.id <br>
  member = "group:{local.minecraft_switch_access_group}" <br>
} <br>
<br>
resource "google_project_iam_member" "projectBrowsers" { <br>
  count = local.enable_switch_access_group <br>
  project = local.project <br>
  role    = "roles/browser" <br>
  member  = "group:{local.minecraft_switch_access_group}" <br>
} <br>
<br>
resource "google_project_iam_member" "computeViewer" { <br>
  count = local.enable_switch_access_group <br>
  project = local.project <br>
  role    = google_project_iam_custom_role.instanceLister.id <br>
  member  = "group:{local.minecraft_switch_access_group}" <br>
} <br>
`

const terraform_code_3 = `

# [START iam_create_deny_policy]
data "google_project" "default" { <br>
} <br>
<br>
# Create a service account <br>
resource "google_service_account" "default" { <br>
  display_name = "IAM Deny Example - Service Account" <br>
  account_id   = "example-sa" <br>
  project      = data.google_project.default.project_id <br>
} <br>
<br>
# Create an IAM deny policy that denies a permission for the service account <br>
resource "google_iam_deny_policy" "default" { <br>
  provider     = google-beta <br>
  parent       = urlencode("cloudresourcemanager.googleapis.com/projects/{data.google_project.default.project_id}") <br>
  name         = "my-deny-policy" <br>
  display_name = "My deny policy." <br>
  rules { <br>
    deny_rule { <br>
      denied_principals  = ["principal://iam.googleapis.com/projects/-/serviceAccounts/{google_service_account.default.email}"] <br>
      denied_permissions = ["iam.googleapis.com/roles.create"] <br>
    } <br>
  } <br>
} <br>
# [END iam_create_deny_policy] 

`

const terraform_code_4=`
# [START cloud_sql_mysql_instance_ha] <br>
resource "google_sql_database_instance" "mysql_instance_ha" { <br>
  name             = "mysql-instance-ha" <br>
  region           = "asia-northeast1" <br>
  database_version = "MYSQL_8_0" <br>
  settings { <br>
    tier              = "db-f1-micro" <br>
    availability_type = "REGIONAL" <br>
    backup_configuration { <br>
      enabled            = true <br>
      binary_log_enabled = true <br>
      start_time         = "20:55" <br>
    } <br>
  } <br>
  deletion_protection = false <br>
} <br>
# [END cloud_sql_mysql_instance_ha] <br>

# [START cloud_sql_postgres_instance_ha] <br>
resource "google_sql_database_instance" "postgres_instance_ha" { <br>
  name             = "postgres-instance-ha" <br>
  region           = "us-central1" <br>
  database_version = "POSTGRES_14" <br>
  settings { <br>
    tier              = "db-custom-2-7680" <br>
    availability_type = "REGIONAL" <br>
    backup_configuration { <br>
      enabled                        = true <br>
      point_in_time_recovery_enabled = true <br>
      start_time                     = "20:55" <br>
    } <br>
  } <br>
  deletion_protection = false <br>
} <br>
# [END cloud_sql_postgres_instance_ha] <br>

# [START cloud_sql_sqlserver_instance_ha] <br>
resource "google_sql_database_instance" "default" { <br>
  name             = "sqlserver-instance-ha" <br>
  region           = "us-central1" <br>
  database_version = "SQLSERVER_2019_STANDARD" <br>
  root_password    = "INSERT-PASSWORD-HERE" <br>
  settings { <br>
    tier              = "db-custom-2-7680" <br>
    availability_type = "REGIONAL" <br>
    backup_configuration { <br>
      enabled    = true <br>
      start_time = "20:55" <br>
    } <br>
  } <br>
  deletion_protection = false <br>
} <br>
# [END cloud_sql_sqlserver_instance_ha] <br>
`