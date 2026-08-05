def citation_node(state):

    sources = state.get("retrieved_sources", [])

    if not sources:
        return state

    citations = []

    for source in sources:

        source_name = source.get("source", "Knowledge Base")

        chunk = source.get("chunk")

        if chunk is not None:
            citations.append(
                f"{source_name} (Chunk {chunk})"
            )
        else:
            citations.append(source_name)

    state["answer"] += "\n\nSources:\n"

    state["answer"] += "\n".join(citations)

    return state