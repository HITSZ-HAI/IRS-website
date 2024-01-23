from chatgpt import ChatGPT
def main():
    # 初始化ChatGPT对象
    chatbot = ChatGPT()
    # 向ChatGPT提问
    response = chatbot.ask("Do you like pizza?")
    print(response)
if __name__ == "__main__":
    main()