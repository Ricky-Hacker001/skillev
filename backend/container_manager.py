import docker
import socket
import time
import threading
from datetime import datetime

client = docker.from_env()

def find_free_port():
    """Finds an available port on the host machine dynamically."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        return s.getsockname()[1]

def get_or_create_room_network(domain: str):
    """Creates a standard bridge network for the domain."""
    network_name = f"{domain}_room_net"
    try:
        return client.networks.get(network_name)
    except docker.errors.NotFound:
        return client.networks.create(network_name, driver="bridge")

def stream_container_logs(container_id, user_id, task_id):
    """
    THE EVIDENCE ENGINE: Streams logs and captures proof points.
    """
    try:
        container = client.containers.get(container_id)
        # Use tail=0 to only get new logs moving forward
        for line in container.logs(stream=True, follow=True, tail=0):
            log_entry = line.decode('utf-8').strip()
            
            # Evidence Capture Logic
            if "EVIDENCE_LOG" in log_entry or "SELECT" in log_entry.upper():
                print(f"💎 PROOF CAPTURED [User {user_id} | {task_id}]: {log_entry}")
                
    except Exception as e:
        print(f"Evidence stream interrupted: {e}")

def start_sub_room_container(user_id: int, domain: str, task_id: str):
    """
    Orchestrates the lifecycle with extended health checks to prevent 
    frontend loading hangs.
    """
    get_or_create_room_network(domain)
    container_name = f"skillev_{domain}_{task_id}_{user_id}"
    
    image_map = {
        "sql-injection": "skillev-labs-sqli:latest",
        "broken-auth": "skillev-labs-auth:latest"
    }
    
    image = image_map.get(task_id)
    if not image:
        return None, "Task image not found"

    # 1. CLEANUP
    try:
        old_container = client.containers.get(container_name)
        old_container.stop(timeout=2)
        old_container.remove()
    except docker.errors.NotFound:
        pass 

    # 2. PORT ALLOCATION
    assigned_port = find_free_port()

    # 3. CONTAINER EXECUTION
    try:
        client.images.get(image)
        
        container = client.containers.run(
            image=image,
            name=container_name,
            network=f"{domain}_room_net",
            detach=True,
            mem_limit="256m",
            nano_cpus=500000000, # 0.5 CPU limit
            ports={'5000/tcp': ('127.0.0.1', assigned_port)}, 
            labels={
                "user_id": str(user_id),
                "domain": domain,
                "task_id": task_id,
                "port": str(assigned_port)
            }
        )

        # 4. EXTENDED MICRO-POLLING HEALTH CHECK
        # We now check every 100ms for up to 6 seconds (60 attempts).
        # This ensures the sandbox is 100% ready for the iframe.
        is_ready = False
        for _ in range(60): 
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(0.1) 
                if s.connect_ex(('127.0.0.1', assigned_port)) == 0:
                    # Small grace period for the web server inside to bind its headers
                    time.sleep(0.5) 
                    is_ready = True
                    break
            time.sleep(0.1) 

        if is_ready:
            # 5. START EVIDENCE ENGINE
            threading.Thread(
                target=stream_container_logs, 
                args=(container.id, user_id, task_id), 
                daemon=True
            ).start()
            
            return {"container_id": container.id, "port": assigned_port}, None
        
        return {"container_id": container.id, "port": assigned_port}, "Warning: Service health check timed out."

    except Exception as e:
        return None, f"Orchestration Error: {str(e)}"

def kill_sub_room(container_id: str):
    """Safe termination of the environment."""
    try:
        container = client.containers.get(container_id)
        container.stop(timeout=2)
        container.remove()
        return True
    except Exception:
        return False