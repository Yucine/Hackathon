class Scheduler:

    def score(self, node):

        return (

            node["cpu_usage"] * 0.5 +
            node["ram_usage"] * 0.3 +
            node["network_usage"] * 0.2

        )


    def select(self, nodes):

        best_node = None
        best_score = float("inf")

        for node in nodes:

            score = self.score(node)

            if score < best_score:

                best_score = score
                best_node = node

        return best_node