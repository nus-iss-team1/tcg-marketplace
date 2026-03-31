from locust import HttpUser, task, between


class WebStressTest(HttpUser):
    wait_time = between(0.1, 0.5)

    @task(5)
    def homepage(self):
        self.client.get("/")

    @task(3)
    def marketplace_pokemon(self):
        self.client.get("/marketplace?game=Pokemon%20TCG")

    @task(3)
    def marketplace_digimon(self):
        self.client.get("/marketplace?game=Digimon%20Card%20Game")

    @task(3)
    def marketplace_magic(self):
        self.client.get("/marketplace?game=Magic%3A%20The%20Gathering")

    @task(3)
    def marketplace_onepiece(self):
        self.client.get("/marketplace?game=One%20Piece%20Card%20Game")

    @task(3)
    def marketplace_starwars(self):
        self.client.get("/marketplace?game=Star%20Wars%3A%20Unlimited")

    @task(3)
    def marketplace_yugioh(self):
        self.client.get("/marketplace?game=Yu-Gi-Oh!")
