import networkx as nx


def goldberg(k):
    graph = nx.Graph()

    for i in range(k):
        for u, v in "ab bc bd ce cg df dh ef gh".split():
            graph.add_edge((u, i), (v, i))

        for u, v in "aa ef hg".split():
            graph.add_edge((u, i), (v, (i + 1) % k))

    return graph
