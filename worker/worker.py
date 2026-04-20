import time


def run_worker_loop() -> None:
    print("Compliance Explained worker started.")
    print("This service is where async document parsing, queue handling, and export jobs will run.")
    while True:
        time.sleep(5)
        print("Worker heartbeat...")


if __name__ == "__main__":
    run_worker_loop()

