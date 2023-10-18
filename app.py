from flask import Flask, request, render_template
import vertexai
from vertexai.preview.language_models import ChatModel, InputOutputTextPair

from flask_cors import CORS, cross_origin

app = Flask(__name__)
# cors = CORS(app)
# app.config['CORS_HEADERS'] = 'Content-Type'



terraform_code_1 = """
/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

# [START storage_flask_google_cloud_quickstart_parent_tag]
# [START compute_flask_quickstart_vpc]
resource "google_compute_network" "vpc_network" {
  name                    = "my-custom-mode-network"
  auto_create_subnetworks = false
  mtu                     = 1460
}

resource "google_compute_subnetwork" "default" {
  name          = "my-custom-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = "us-west1"
  network       = google_compute_network.vpc_network.id
}
# [END compute_flask_quickstart_vpc]

# [START compute_flask_quickstart_vm]
# Create a single Compute Engine instance
resource "google_compute_instance" "default" {
  name         = "flask-vm"
  machine_type = "f1-micro"
  zone         = "us-west1-a"
  tags         = ["ssh"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  # Install Flask
  metadata_startup_script = "sudo apt-get update; sudo apt-get install -yq build-essential python3-pip rsync; pip install flask"

  network_interface {
    subnetwork = google_compute_subnetwork.default.id

    access_config {
      # Include this section to give the VM an external IP address
    }
  }
}
# [END compute_flask_quickstart_vm]

# [START vpc_flask_quickstart_ssh_fw]
resource "google_compute_firewall" "ssh" {
  name = "allow-ssh"
  allow {
    ports    = ["22"]
    protocol = "tcp"
  }
  direction     = "INGRESS"
  network       = google_compute_network.vpc_network.id
  priority      = 1000
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["ssh"]
}
# [END vpc_flask_quickstart_ssh_fw]


# [START vpc_flask_quickstart_5000_fw]
resource "google_compute_firewall" "flask" {
  name    = "flask-app-firewall"
  network = google_compute_network.vpc_network.id

  allow {
    protocol = "tcp"
    ports    = ["5000"]
  }
  source_ranges = ["0.0.0.0/0"]
}
# [END vpc_flask_quickstart_5000_fw]

# Create new multi-region storage bucket in the US
# with versioning enabled

# [START storage_kms_encryption_tfstate]
resource "google_kms_key_ring" "terraform_state" {
  name     = "${random_id.bucket_prefix.hex}-bucket-tfstate"
  location = "us"
}

resource "google_kms_crypto_key" "terraform_state_bucket" {
  name            = "test-terraform-state-bucket"
  key_ring        = google_kms_key_ring.terraform_state.id
  rotation_period = "86400s"

  lifecycle {
    prevent_destroy = false
  }
}

# Enable the Cloud Storage service account to encrypt/decrypt Cloud KMS keys
data "google_project" "project" {
}

resource "google_project_iam_member" "default" {
  project = data.google_project.project.project_id
  role    = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member  = "serviceAccount:service-${data.google_project.project.number}@gs-project-accounts.iam.gserviceaccount.com"
}
# [END storage_kms_encryption_tfstate]

# [START storage_bucket_tf_with_versioning]
resource "random_id" "bucket_prefix" {
  byte_length = 8
}

resource "google_storage_bucket" "default" {
  name          = "${random_id.bucket_prefix.hex}-bucket-tfstate"
  force_destroy = false
  location      = "US"
  storage_class = "STANDARD"
  versioning {
    enabled = true
  }
  encryption {
    default_kms_key_name = google_kms_crypto_key.terraform_state_bucket.id
  }
  depends_on = [
    google_project_iam_member.default
  ]
}
# [END storage_bucket_tf_with_versioning]
# [END storage_flask_google_cloud_quickstart_parent_tag]
"""

terraform_code_2="""
/*
Connect with friends via a shared digital space in Minecraft.

This is a safe Minecraft server that won't break the bank. Game data is preserved across sessions.
Server is hosted on a permenant IP address. You need to start the VM each session, but it
will shutdown within 24 hours if you forget to turn it off.
Process is run in a sandboxed VM, so any server exploits cannot do any serious damage.

We are experimenting with providing support through a [google doc](https://docs.google.com/document/d/1TXyzHKqoKMS-jY9FSMrYNLEGathqSG8YuHdj0Z9GP34).
Help us make this simple for others to use by asking for help.


Features
- Runs [itzg/minecraft-server](https://hub.docker.com/r/itzg/minecraft-server/) Docker image
- Preemtible VM (cheapest), shuts down automatically within 24h if you forget to stop the VM
- Reserves a stable public IP, so the minecraft clients do not need to be reconfigured
- Reserves the disk, so game data is remembered across sessions
- Restricted service account, VM has no ability to consume GCP resources beyond its instance and disk
- 2$ per month
  - Reserved IP address costs: $1.46 per month
  - Reserved 10Gb disk costs: $0.40
  - VM cost: $0.01 per hour, max session cost $0.24
*/

# We require a project to be provided upfront
# Create a project at https://cloud.google.com/
# Make note of the project ID
# We need a storage bucket created upfront too to store the terraform state
terraform {
  backend "gcs" {
    prefix = "minecraft/state"
    bucket = "terraform-larkworthy"
  }
}

# You need to fill these locals out with the project, region and zone
# Then to boot it up, run:-
#   gcloud auth application-default login
#   terraform init
#   terraform apply
locals {
  # The Google Cloud Project ID that will host and pay for your Minecraft server
  project = "larkworthy-tester"
  region  = "europe-west1"
  zone    = "europe-west1-b"
  # Allow members of an external Google group to turn on the server
  # through the Cloud Console mobile app or https://console.cloud.google.com
  # Create a group at https://groups.google.com/forum/#!creategroup
  # and invite members by their email address.
  enable_switch_access_group = 1
  minecraft_switch_access_group = "minecraft-switchers-lark@googlegroups.com"
}


provider "google" {
  project = local.project
  region  = local.region
}

# Create service account to run service with no permissions
resource "google_service_account" "minecraft" {
  account_id   = "minecraft"
  display_name = "minecraft"
}

# Permenant Minecraft disk, stays around when VM is off
resource "google_compute_disk" "minecraft" {
  name  = "minecraft"
  type  = "pd-standard"
  zone  = local.zone
  image = "cos-cloud/cos-stable"
}

# Permenant IP address, stays around when VM is off
resource "google_compute_address" "minecraft" {
  name   = "minecraft-ip"
  region = local.region
}

# VM to run Minecraft, we use preemptable which will shutdown within 24 hours
resource "google_compute_instance" "minecraft" {
  name         = "minecraft"
  machine_type = "n1-standard-1"
  zone         = local.zone
  tags         = ["minecraft"]

  # Run itzg/minecraft-server docker image on startup
  # The instructions of https://hub.docker.com/r/itzg/minecraft-server/ are applicable
  # For instance, Ssh into the instance and you can run
  #  docker logs mc
  #  docker exec -i mc rcon-cli
  # Once in rcon-cli you can "op <player_id>" to make someone an operator (admin)
  # Use 'sudo journalctl -u google-startup-scripts.service' to retrieve the startup script output
  metadata_startup_script = "docker run -d -p 25565:25565 -e EULA=TRUE -e VERSION=1.12.2 -v /var/minecraft:/data --name mc -e TYPE=FORGE -e FORGEVERSION=14.23.0.2552 -e MEMORY=2G --rm=true itzg/minecraft-server:latest;"

  metadata = {
    enable-oslogin = "TRUE"
  }

  boot_disk {
    auto_delete = false # Keep disk after shutdown (game data)
    source      = google_compute_disk.minecraft.self_link
  }

  network_interface {
    network = google_compute_network.minecraft.name
    access_config {
      nat_ip = google_compute_address.minecraft.address
    }
  }

  service_account {
    email  = google_service_account.minecraft.email
    scopes = ["userinfo-email"]
  }

  scheduling {
    preemptible       = true # Closes within 24 hours (sometimes sooner)
    automatic_restart = false
  }
}

# Create a private network so the minecraft instance cannot access
# any other resources.
resource "google_compute_network" "minecraft" {
  name = "minecraft"
}

# Open the firewall for Minecraft traffic
resource "google_compute_firewall" "minecraft" {
  name    = "minecraft"
  network = google_compute_network.minecraft.name
  # Minecraft client port
  allow {
    protocol = "tcp"
    ports    = ["25565"]
  }
  # ICMP (ping)
  allow {
    protocol = "icmp"
  }
  # SSH (for RCON-CLI access)
  allow {
    protocol = "tcp"
    ports    = ["22"]
  }
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["minecraft"]
}

resource "google_project_iam_custom_role" "minecraftSwitcher" {
  role_id     = "MinecraftSwitcher"
  title       = "Minecraft Switcher"
  description = "Can turn a VM on and off"
  permissions = ["compute.instances.start", "compute.instances.stop", "compute.instances.get"]
}

resource "google_project_iam_custom_role" "instanceLister" {
  role_id     = "InstanceLister"
  title       = "Instance Lister"
  description = "Can list VMs in project"
  permissions = ["compute.instances.list"]
}

resource "google_compute_instance_iam_member" "switcher" {
  count = local.enable_switch_access_group
  project = local.project
  zone = local.zone
  instance_name = google_compute_instance.minecraft.name
  role = google_project_iam_custom_role.minecraftSwitcher.id
  member = "group:${local.minecraft_switch_access_group}"
}

resource "google_project_iam_member" "projectBrowsers" {
  count = local.enable_switch_access_group
  project = local.project
  role    = "roles/browser"
  member  = "group:${local.minecraft_switch_access_group}"
}

resource "google_project_iam_member" "computeViewer" {
  count = local.enable_switch_access_group
  project = local.project
  role    = google_project_iam_custom_role.instanceLister.id
  member  = "group:${local.minecraft_switch_access_group}"
}
"""

vertexai.init(project="test-data-studio-365519", location="us-central1")
chat_model = ChatModel.from_pretrained("chat-bison-32k")
parameters = {
    "max_output_tokens": 3697,
    "temperature": 0.6,
    "top_p": 0.43,
    "top_k": 17
}



@app.route("/")
def hello_world():
    return render_template("index.html")

context_text = """You are an expert google cloud architect. Use the following terraform code to answer user\'s question. Don\'t hallucinate, instead say you don\'t know the answer. Understand nuances like compute instances is the same as VM.
    """ + terraform_code_1
global chat 
chat = chat_model.start_chat(context=context_text)
global selected_terraform 
selected_terraform = "Terraform 1"

@app.route('/postchat',methods = ['POST', 'GET'])
@cross_origin()
def chatresponse():
    
    if request.method == 'POST':
        values = request.json
        print(values)
        prompt = values['prompt']
        global selected_terraform 
        if(values['terraform_example']!=selected_terraform):
          context_text = """You are an expert google cloud architect. Use the following terraform code to answer user\'s question. Don\'t hallucinate, instead say you don\'t know the answer. Understand nuances like compute instances is the same as VM.
          """
          if(values['terraform_example']=="Terraform 1"):
            context_text = context_text + terraform_code_1
            selected_terraform="Terraform 1"
          else:
            context_text = context_text + terraform_code_2
            selected_terraform="Terraform 2"
          global chat
          chat = chat_model.start_chat(context=context_text)
          print(context_text)
        

        response = chat.send_message(prompt, **parameters)

        result = {
            "status" : 200,
            "message": response
        }
        return result
    else:
        return "Didn't get it"

if __name__=="__main__":
    app.run(debug=True)


