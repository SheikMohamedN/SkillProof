def mentor_reply(message: str, task_title: str) -> str:
    text = message.lower()
    if "missing" in text or "null" in text:
        return "Before changing the data, inspect where the missing values are and how frequent they are. Then ask: what replacement rule would preserve the meaning of this column?"
    if "duplicate" in text:
        return "First define what makes two rows the same record. Check the relevant identifiers before removing anything."
    if "error" in text or "bug" in text:
        return "Read the error from the first useful line. What object or data type does that line assume it received?"
    if "start" in text:
        return "Start by translating the task requirements into a short checklist. Which requirement can you verify first from the raw data?"
    return f"For '{task_title}', try narrowing your question to one requirement at a time. What evidence would prove that your current approach worked?"
